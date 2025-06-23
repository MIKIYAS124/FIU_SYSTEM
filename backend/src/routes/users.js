const express = require("express")
const { body, validationResult } = require("express-validator")
const { createUser, getUsers, updateUser, deleteUser } = require("../controllers/userController")
const { authenticate } = require("../middleware/auth")

const router = express.Router()

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// Authorization middleware for admin roles
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "INTERMEDIATE_ADMIN") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

// All routes require authentication and admin access
router.use(authenticate)
router.use(requireAdmin)

// Create user
router.post(
  "/",
  [
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["SUPER_ADMIN", "INTERMEDIATE_ADMIN", "DATA_ENCODER"]).withMessage("Invalid role"),
  ],
  validateRequest,
  createUser,
)

// Get all users
router.get("/", getUsers)

// Update user
router.put(
  "/:id",
  [
    body("username").optional().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").optional().isEmail().withMessage("Please provide a valid email"),
    body("role").optional().isIn(["SUPER_ADMIN", "INTERMEDIATE_ADMIN", "DATA_ENCODER"]).withMessage("Invalid role"),
  ],
  validateRequest,
  updateUser,
)

// Delete user
router.delete("/:id", deleteUser)

module.exports = router
