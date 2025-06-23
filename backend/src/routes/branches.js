const express = require("express")
const { body, validationResult } = require("express-validator")
const { createBranch, getBranches, updateBranch, deleteBranch } = require("../controllers/branchController")
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

// Authorization middleware for intermediate admin
const requireIntermediateAdmin = (req, res, next) => {
  if (req.user.role !== "INTERMEDIATE_ADMIN") {
    return res.status(403).json({ error: "Intermediate admin access required" })
  }
  next()
}

// All routes require authentication
router.use(authenticate)

// Get branches (all authenticated users can view)
router.get("/", getBranches)

// Create, update, delete require intermediate admin
router.post(
  "/",
  requireIntermediateAdmin,
  [
    body("name").notEmpty().withMessage("Branch name is required"),
    body("code").notEmpty().withMessage("Branch code is required"),
    body("address").notEmpty().withMessage("Branch address is required"),
  ],
  validateRequest,
  createBranch,
)

router.put(
  "/:id",
  requireIntermediateAdmin,
  [
    body("name").optional().notEmpty().withMessage("Branch name cannot be empty"),
    body("code").optional().notEmpty().withMessage("Branch code cannot be empty"),
    body("address").optional().notEmpty().withMessage("Branch address cannot be empty"),
  ],
  validateRequest,
  updateBranch,
)

router.delete("/:id", requireIntermediateAdmin, deleteBranch)

module.exports = router
