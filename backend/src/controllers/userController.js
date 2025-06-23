const bcrypt = require("bcryptjs")
const { pool } = require("../config/database")

const createUser = async (req, res) => {
  try {
    const { username, email, password, role = "DATA_ENCODER" } = req.body

    // Check permissions
    if (req.user.role === "INTERMEDIATE_ADMIN" && (role === "SUPER_ADMIN" || role === "INTERMEDIATE_ADMIN")) {
      return res.status(403).json({ error: "Insufficient permissions to create this role" })
    }

    // Check if user exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username])

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at",
      [username, email, hashedPassword, role],
    )

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const getUsers = async (req, res) => {
  try {
    let query = "SELECT id, username, email, role, created_at FROM users"
    let params = []

    // Intermediate admin can only see DATA_ENCODER users
    if (req.user.role === "INTERMEDIATE_ADMIN") {
      query += " WHERE role = $1"
      params = ["DATA_ENCODER"]
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)

    res.json({
      users: result.rows,
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, role } = req.body

    // Check permissions
    if (req.user.role === "INTERMEDIATE_ADMIN" && (role === "SUPER_ADMIN" || role === "INTERMEDIATE_ADMIN")) {
      return res.status(403).json({ error: "Insufficient permissions to assign this role" })
    }

    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2, role = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, email, role",
      [username, email, role, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Prevent self-deletion
    if (req.user.id === Number.parseInt(id)) {
      return res.status(400).json({ error: "Cannot delete your own account" })
    }

    const result = await pool.query("DELETE FROM users WHERE id = $1", [id])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
}
