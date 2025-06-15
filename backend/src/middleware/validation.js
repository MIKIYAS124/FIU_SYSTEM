const { validationResult } = require("express-validator")
const { ResponseHelper } = require("../utils/response")

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = {}

    errors.array().forEach((error) => {
      const field = error.path || error.param
      if (!formattedErrors[field]) {
        formattedErrors[field] = []
      }
      formattedErrors[field].push(error.msg)
    })

    return ResponseHelper.validationError(res, "Validation failed", formattedErrors)
  }

  next()
}

module.exports = {
  handleValidationErrors,
}
