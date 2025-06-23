const { pool } = require("../config/database")

const createReport = async (req, res) => {
  try {
    const { transaction_date, transaction_amount, account_number, account_holder_name, suspicious_activity } = req.body

    const result = await pool.query(
      `INSERT INTO reports (
        user_id, transaction_date, transaction_amount, 
        account_number, account_holder_name, suspicious_activity
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, transaction_date, transaction_amount, account_number, account_holder_name, suspicious_activity],
    )

    res.status(201).json({
      message: "Report created successfully",
      report: result.rows[0],
    })
  } catch (error) {
    console.error("Create report error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const getReports = async (req, res) => {
  try {
    let query = "SELECT * FROM reports"
    let params = []

    // If not admin, only show user's reports
    if (req.user.role !== "SUPER_ADMIN") {
      query += " WHERE user_id = $1"
      params = [req.user.id]
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)

    res.json({
      reports: result.rows,
    })
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const getReport = async (req, res) => {
  try {
    const { id } = req.params

    let query = "SELECT * FROM reports WHERE id = $1"
    const params = [id]

    // If not admin, check ownership
    if (req.user.role !== "SUPER_ADMIN") {
      query += " AND user_id = $2"
      params.push(req.user.id)
    }

    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" })
    }

    res.json({
      report: result.rows[0],
    })
  } catch (error) {
    console.error("Get report error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const updateReport = async (req, res) => {
  try {
    const { id } = req.params
    const { transaction_date, transaction_amount, account_number, account_holder_name, suspicious_activity } = req.body

    let query = `UPDATE reports SET 
      transaction_date = $1, transaction_amount = $2, 
      account_number = $3, account_holder_name = $4, 
      suspicious_activity = $5, updated_at = NOW()
      WHERE id = $6`
    const params = [transaction_date, transaction_amount, account_number, account_holder_name, suspicious_activity, id]

    // If not admin, check ownership
    if (req.user.role !== "SUPER_ADMIN") {
      query += " AND user_id = $7"
      params.push(req.user.id)
    }

    query += " RETURNING *"

    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found or access denied" })
    }

    res.json({
      message: "Report updated successfully",
      report: result.rows[0],
    })
  } catch (error) {
    console.error("Update report error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params

    let query = "DELETE FROM reports WHERE id = $1"
    const params = [id]

    // If not admin, check ownership
    if (req.user.role !== "SUPER_ADMIN") {
      query += " AND user_id = $2"
      params.push(req.user.id)
    }

    const result = await pool.query(query, params)

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Report not found or access denied" })
    }

    res.json({ message: "Report deleted successfully" })
  } catch (error) {
    console.error("Delete report error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
}
