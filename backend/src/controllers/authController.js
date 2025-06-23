const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

const register = async (req, res) => {
  try {
    const { username, email, password, role = "DATA_ENCODER" } = req.body

    // Check if user exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username])

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role",
      [username, email, hashedPassword, role],
    )

    const user = result.rows[0]

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $1", [username])

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const getProfile = async (req, res) => {
  try {
    const { id, username, email, role } = req.user
    res.json({
      user: { id, username, email, role },
    })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = { register, login, getProfile }
