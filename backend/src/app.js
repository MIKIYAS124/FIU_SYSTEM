const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Middleware
app.use(cors())
app.use(express.json())

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "FIU System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      reports: "/api/reports",
      users: "/api/users",
      branches: "/api/branches",
      entities: "/api/reporting-entities"
    }
  })
})

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" })
    req.user = user
    next()
  })
}

// Routes

// Login
app.post("/api/auth/login", [body("username").notEmpty(), body("password").notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get current user
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email, role, full_name FROM users WHERE id = $1", [
      req.user.id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get reports (role-based)
app.get("/api/reports", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT r.*, u.full_name as user_name, e.name as entity_name, b.name as branch_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN reporting_entities e ON r.entity_id = e.id
      LEFT JOIN branches b ON r.branch_id = b.id
    `
    let params = []

    // Role-based filtering
    if (req.user.role === "DATA_ENCODER") {
      query += " WHERE r.user_id = $1"
      params = [req.user.id]
    }

    query += " ORDER BY r.created_at DESC"

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Create report
app.post(
  "/api/reports",
  authenticateToken,
  [
    body("transaction_date").isDate(),
    body("transaction_amount").isNumeric(),
    body("account_holder_name").notEmpty(),
    body("suspicious_activity").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        entity_id,
        branch_id,
        transaction_date,
        transaction_amount,
        account_number,
        account_holder_name,
        beneficiary_name,
        suspicious_activity,
        additional_info,
      } = req.body

      // Generate report number
      const reportCount = await pool.query("SELECT COUNT(*) FROM reports")
      const reportNumber = `STR-2024-${String(Number.parseInt(reportCount.rows[0].count) + 1).padStart(6, "0")}`

      const result = await pool.query(
        `
      INSERT INTO reports (
        report_number, user_id, entity_id, branch_id, transaction_date,
        transaction_amount, account_number, account_holder_name,
        beneficiary_name, suspicious_activity, additional_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
        [
          reportNumber,
          req.user.id,
          entity_id,
          branch_id,
          transaction_date,
          transaction_amount,
          account_number,
          account_holder_name,
          beneficiary_name,
          suspicious_activity,
          additional_info,
        ],
      )

      res.status(201).json(result.rows[0])
    } catch (error) {
      console.error("Create report error:", error)
      res.status(500).json({ error: "Server error" })
    }
  },
)

// Get users (admin only)
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    if (!["SUPER_ADMIN", "INTERMEDIATE_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" })
    }

    let query = "SELECT id, username, email, role, full_name, created_at FROM users"
    let params = []

    // Intermediate admin can only see DATA_ENCODER users
    if (req.user.role === "INTERMEDIATE_ADMIN") {
      query += " WHERE role = $1"
      params = ["DATA_ENCODER"]
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Create user (admin only)
app.post(
  "/api/users",
  authenticateToken,
  [
    body("username").notEmpty().trim(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["DATA_ENCODER", "INTERMEDIATE_ADMIN", "SUPER_ADMIN"]),
    body("full_name").notEmpty().trim(),
  ],
  async (req, res) => {
    try {
      // Only intermediate admins can create data encoders
      if (req.body.role === "DATA_ENCODER") {
        if (req.user.role !== "INTERMEDIATE_ADMIN") {
          return res.status(403).json({ error: "Only intermediate admins can create data encoders" })
        }
      } else {
        // Only super admin can create intermediate admins and super admins
        if (req.user.role !== "SUPER_ADMIN") {
          return res.status(403).json({ error: "Only super admin can create this user type" })
        }
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, email, password, role, full_name } = req.body

      // Check if username already exists
      const existingUser = await pool.query("SELECT id FROM users WHERE username = $1", [username])
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Username already exists" })
      }

      // Check if email already exists
      const existingEmail = await pool.query("SELECT id FROM users WHERE email = $1", [email])
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ error: "Email already exists" })
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create user
      const result = await pool.query(
        "INSERT INTO users (username, email, password, role, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, full_name",
        [username, email, hashedPassword, role, full_name]
      )

      res.status(201).json(result.rows[0])
    } catch (error) {
      console.error("Create user error:", error)
      res.status(500).json({ error: "Server error" })
    }
  }
)

// Get reporting entities
app.get("/api/reporting-entities", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reporting_entities ORDER BY name")
    res.json(result.rows)
  } catch (error) {
    console.error("Get entities error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Create reporting entity (super admin only)
app.post(
  "/api/reporting-entities",
  authenticateToken,
  [
    body("name").notEmpty().trim(),
    body("type").isIn(["BANK", "INSURANCE", "MICROFINANCE", "OTHER"]),
    body("license_number").notEmpty().trim(),
  ],
  async (req, res) => {
    try {
      // Check if user has permission to create entities
      if (req.user.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Access denied" })
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, type, license_number, contact_email, contact_phone, address } = req.body

      // Check if license number already exists
      const existingLicense = await pool.query("SELECT id FROM reporting_entities WHERE license_number = $1", [license_number])
      if (existingLicense.rows.length > 0) {
        return res.status(400).json({ error: "License number already exists" })
      }

      // Create reporting entity
      const result = await pool.query(
        `INSERT INTO reporting_entities (
          name, type, license_number, contact_email, contact_phone, address
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, type, license_number, contact_email, contact_phone, address]
      )

      res.status(201).json(result.rows[0])
    } catch (error) {
      console.error("Create entity error:", error)
      res.status(500).json({ error: "Server error" })
    }
  }
)

// Get branches
app.get("/api/branches", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, e.name as entity_name
      FROM branches b
      LEFT JOIN reporting_entities e ON b.entity_id = e.id
      ORDER BY b.name
    `)
    res.json(result.rows)
  } catch (error) {
    console.error("Get branches error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Create branch (intermediate admin only)
app.post(
  "/api/branches",
  authenticateToken,
  [
    body("name").notEmpty().trim(),
    body("code").notEmpty().trim(),
    body("address").notEmpty().trim(),
    body("entity_id").isInt(),
  ],
  async (req, res) => {
    try {
      // Check if user has permission to create branches
      if (req.user.role !== "INTERMEDIATE_ADMIN") {
        return res.status(403).json({ error: "Access denied" })
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, code, address, entity_id, manager_name, phone, email } = req.body

      // Check if branch code already exists
      const existingCode = await pool.query("SELECT id FROM branches WHERE code = $1", [code])
      if (existingCode.rows.length > 0) {
        return res.status(400).json({ error: "Branch code already exists" })
      }

      // Check if entity exists
      const entityExists = await pool.query("SELECT id FROM reporting_entities WHERE id = $1", [entity_id])
      if (entityExists.rows.length === 0) {
        return res.status(400).json({ error: "Reporting entity not found" })
      }

      // Create branch
      const result = await pool.query(
        `INSERT INTO branches (
          name, code, address, entity_id, manager_name, phone, email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, code, address, entity_id, manager_name, phone, email]
      )

      res.status(201).json(result.rows[0])
    } catch (error) {
      console.error("Create branch error:", error)
      res.status(500).json({ error: "Server error" })
    }
  }
)
// In app.js (after other app.use/health routes)
// Transaction Manners
app.get("/api/transaction-manners", async (req, res) => {
  const result = await pool.query("SELECT id, type FROM transaction_manners ORDER BY type");
  res.json({ data: result.rows });
});
app.post("/api/transaction-manners", async (req, res) => {
  const { type } = req.body;
  const result = await pool.query(
    "INSERT INTO transaction_manners (type) VALUES ($1) RETURNING *",
    [type]
  );
  res.status(201).json(result.rows[0]);
});
// Update transaction manner
app.put("/api/transaction-manners/:id", async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const result = await pool.query(
    "UPDATE transaction_manners SET type = $1 WHERE id = $2 RETURNING *",
    [type, id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Transaction manner not found" });
  }
  res.json(result.rows[0]);
});
// Delete transaction manner
app.delete("/api/transaction-manners/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "DELETE FROM transaction_manners WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Transaction manner not found" });
  }
  res.json({ message: "Transaction manner deleted successfully" });
});
// Crime Types
app.get("/api/crime-types", async (req, res) => {
  const result = await pool.query("SELECT id, type FROM crime_types ORDER BY type");
  res.json({ data: result.rows });
});
app.post("/api/crime-types", async (req, res) => {
  const { type } = req.body;
  const result = await pool.query(
    "INSERT INTO crime_types (type) VALUES ($1) RETURNING *",
    [type]
  );
  res.status(201).json(result.rows[0]);
});
// Update crime type
app.put("/api/crime-types/:id", async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const result = await pool.query(
    "UPDATE crime_types SET type = $1 WHERE id = $2 RETURNING *",
    [type, id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Crime type not found" });
  }
  res.json(result.rows[0]);
});
// Delete crime type
app.delete("/api/crime-types/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "DELETE FROM crime_types WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Crime type not found" });
  }
  res.json({ message: "Crime type deleted successfully" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 FIU Backend running on port ${PORT}`)
})
