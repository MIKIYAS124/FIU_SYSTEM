class ResponseHelper {
  static success(res, message, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    })
  }

  static error(res, message, error, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    })
  }

  static validationError(res, message, errors) {
    return res.status(422).json({
      success: false,
      message,
      errors,
    })
  }

  static paginated(res, message, data, pagination) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    })
  }

  static unauthorized(res, message = "Unauthorized") {
    return res.status(401).json({
      success: false,
      message,
      error: "Authentication required",
    })
  }

  static forbidden(res, message = "Forbidden") {
    return res.status(403).json({
      success: false,
      message,
      error: "Insufficient permissions",
    })
  }

  static notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
      error: "Not found",
    })
  }

  static serverError(res, message = "Internal server error") {
    return res.status(500).json({
      success: false,
      message,
      error: "Server error",
    })
  }
}

module.exports = { ResponseHelper }
