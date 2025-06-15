const fs = require("fs")
const path = require("path")

const LogLevel = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
}

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), "logs")
    this.ensureLogDirectory()
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : ""
    return `[${timestamp}] ${level}: ${message}${metaStr}\n`
  }

  writeToFile(level, message) {
    const filename = `${level.toLowerCase()}.log`
    const filepath = path.join(this.logDir, filename)
    fs.appendFileSync(filepath, message)
  }

  error(message, meta) {
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, meta)
    console.error(formattedMessage.trim())
    this.writeToFile(LogLevel.ERROR, formattedMessage)
  }

  warn(message, meta) {
    const formattedMessage = this.formatMessage(LogLevel.WARN, message, meta)
    console.warn(formattedMessage.trim())
    this.writeToFile(LogLevel.WARN, formattedMessage)
  }

  info(message, meta) {
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, meta)
    console.info(formattedMessage.trim())
    this.writeToFile(LogLevel.INFO, formattedMessage)
  }

  debug(message, meta) {
    if (process.env.NODE_ENV === "development") {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, meta)
      console.debug(formattedMessage.trim())
      this.writeToFile(LogLevel.DEBUG, formattedMessage)
    }
  }
}

const logger = new Logger()

module.exports = { logger, LogLevel }
