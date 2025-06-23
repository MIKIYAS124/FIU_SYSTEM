const { pool } = require("../config/database")

const createBranch = async (req, res) => {
  try {
    const { name, code, address, entity_id, manager_name, phone, email } = req.body

    // Check if branch code exists
    const branchExists = await pool.query("SELECT * FROM branches WHERE code = $1", [code])

    if (branchExists.rows.length > 0) {
      return res.status(400).json({ error: "Branch code already exists" })
    }

    // Check if entity exists
    const entityExists = await pool.query("SELECT id FROM reporting_entities WHERE id = $1", [entity_id])
    if (entityExists.rows.length === 0) {
      return res.status(400).json({ error: "Reporting entity not found" })
    }

    const result = await pool.query(
      "INSERT INTO branches (name, code, address, entity_id, manager_name, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, code, address, entity_id, manager_name, phone, email]
    )

    res.status(201).json({
      message: "Branch created successfully",
      branch: result.rows[0],
    })
  } catch (error) {
    console.error("Create branch error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const getBranches = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM branches ORDER BY name")

    res.json({
      branches: result.rows,
    })
  } catch (error) {
    console.error("Get branches error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, address } = req.body

    const result = await pool.query(
      "UPDATE branches SET name = $1, code = $2, address = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
      [name, code, address, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Branch not found" })
    }

    res.json({
      message: "Branch updated successfully",
      branch: result.rows[0],
    })
  } catch (error) {
    console.error("Update branch error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM branches WHERE id = $1", [id])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Branch not found" })
    }

    res.json({ message: "Branch deleted successfully" })
  } catch (error) {
    console.error("Delete branch error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  createBranch,
  getBranches,
  updateBranch,
  deleteBranch,
}
