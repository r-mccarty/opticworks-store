/**
 * Structured Logger for Medusa Backend
 *
 * Implements Medusa's Logger interface using Pino for structured JSON logging.
 * Provides consistent log format with correlation IDs and context.
 *
 * Features:
 * - JSON format in production, pretty-printed in development
 * - Correlation ID support for request tracing
 * - Log level filtering based on environment
 * - Sentry-compatible error context
 *
 * Usage:
 *   import { logger, createChildLogger } from "./lib/logger"
 *
 *   // Basic logging
 *   logger.info("Server started")
 *
 *   // Logging with context (recommended)
 *   logger.info({ orderId: "123", customerId: "456" }, "Order created")
 *
 *   // Create a child logger with bound context
 *   const orderLogger = createChildLogger({ module: "orders" })
 *   orderLogger.info({ orderId: "123" }, "Processing order")
 */
import pino, { Logger as PinoLogger } from "pino"
import type { Logger } from "@medusajs/framework/types"

// Environment configuration
const isDev = process.env.NODE_ENV !== "production"
const logLevel = process.env.LOG_LEVEL || (isDev ? "debug" : "info")
const logFile = process.env.LOG_FILE

// Configure Pino transport
// In development: pretty-print to stdout
// In production: JSON to stdout (and optionally to file)
const transport = isDev
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    }
  : logFile
    ? {
        targets: [
          { target: "pino/file", options: { destination: 1 } }, // stdout
          { target: "pino/file", options: { destination: logFile } },
        ],
      }
    : undefined

// Create base Pino logger
const pinoLogger: PinoLogger = pino({
  level: logLevel,
  transport,
  base: {
    service: "medusa-backend",
    env: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Redact sensitive fields
  redact: {
    paths: [
      "password",
      "token",
      "api_key",
      "apiKey",
      "authorization",
      "cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.set-cookie",
    ],
    remove: true,
  },
  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      correlationId: req.correlationId,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
})

// Activity tracking map (for activity/progress/success/failure pattern)
const activities = new Map<string, { message: string; startTime: number }>()
let activityCounter = 0

/**
 * MedusaLogger - Implements Medusa's Logger interface using Pino
 *
 * This wrapper provides compatibility with Medusa's expected logger API
 * while using Pino for structured JSON logging underneath.
 */
class MedusaLogger implements Logger {
  protected _pinoLogger: PinoLogger
  private currentLogLevel: string

  constructor(pinoInstance: PinoLogger) {
    this._pinoLogger = pinoInstance
    this.currentLogLevel = logLevel
  }

  /**
   * Panic - Log and exit (fatal errors)
   */
  panic(data: unknown): void {
    this._pinoLogger.fatal({ data }, "PANIC: Fatal error, shutting down")
    process.exit(1)
  }

  /**
   * Check if a log level should be logged
   */
  shouldLog(level: string): boolean {
    const levels: Record<string, number> = {
      silent: Infinity,
      fatal: 60,
      error: 50,
      warn: 40,
      info: 30,
      http: 25,
      verbose: 22,
      debug: 20,
      silly: 10,
    }
    const currentLevel = levels[this.currentLogLevel] ?? 30
    const targetLevel = levels[level] ?? 30
    return targetLevel >= currentLevel
  }

  /**
   * Set the current log level
   */
  setLogLevel(level: string): void {
    this.currentLogLevel = level
    this._pinoLogger.level = level === "verbose" ? "debug" : level
    this._pinoLogger.debug({ newLevel: level }, "Log level changed")
  }

  /**
   * Reset log level to default
   */
  unsetLogLevel(): void {
    this.currentLogLevel = logLevel
    this._pinoLogger.level = logLevel
  }

  /**
   * Start an activity (for long-running operations)
   * Returns an activity ID for tracking progress
   */
  activity(message: string, config?: unknown): string {
    const activityId = `activity_${++activityCounter}`
    activities.set(activityId, { message, startTime: Date.now() })
    this._pinoLogger.info({ activityId, config, phase: "start" }, message)
    return activityId
  }

  /**
   * Log progress on an activity
   */
  progress(activityId: string, message: string): void {
    const activity = activities.get(activityId)
    const elapsed = activity ? Date.now() - activity.startTime : 0
    this._pinoLogger.info(
      { activityId, phase: "progress", elapsedMs: elapsed },
      message
    )
  }

  /**
   * Log error (string or Error object)
   */
  error(messageOrError: string | Error, error?: Error): void {
    if (error) {
      // error(message, error) form
      this._pinoLogger.error(
        {
          err: error,
          errorMessage: error.message,
          errorStack: error.stack,
        },
        String(messageOrError)
      )
    } else if (messageOrError instanceof Error) {
      // error(Error) form
      this._pinoLogger.error(
        {
          err: messageOrError,
          errorMessage: messageOrError.message,
          errorStack: messageOrError.stack,
        },
        messageOrError.message
      )
    } else {
      // error(string) form
      this._pinoLogger.error(messageOrError)
    }
  }

  /**
   * Log activity failure
   */
  failure(activityId: string, message: string): unknown {
    const activity = activities.get(activityId)
    const elapsed = activity ? Date.now() - activity.startTime : 0
    activities.delete(activityId)
    this._pinoLogger.error(
      { activityId, phase: "failure", elapsedMs: elapsed },
      message
    )
    return null
  }

  /**
   * Log activity success
   */
  success(activityId: string, message: string): Record<string, unknown> {
    const activity = activities.get(activityId)
    const elapsed = activity ? Date.now() - activity.startTime : 0
    activities.delete(activityId)
    this._pinoLogger.info({ activityId, phase: "success", elapsedMs: elapsed }, message)
    return { activityId, message, elapsedMs: elapsed }
  }

  /**
   * Log levels
   */
  silly(message: string): void {
    this._pinoLogger.trace(message)
  }

  debug(message: string): void {
    this._pinoLogger.debug(message)
  }

  verbose(message: string): void {
    this._pinoLogger.debug({ verbose: true }, message)
  }

  http(message: string): void {
    this._pinoLogger.debug({ type: "http" }, message)
  }

  info(message: string): void {
    this._pinoLogger.info(message)
  }

  warn(message: string): void {
    this._pinoLogger.warn(message)
  }

  /**
   * Generic log method (accepts ...args like console.log)
   */
  log(...args: unknown[]): void {
    const message = args.map(String).join(" ")
    this._pinoLogger.info(message)
  }
}

/**
 * Extended logger with Pino's structured logging capabilities
 *
 * This extends MedusaLogger with additional methods for structured logging
 * that accept context objects along with messages.
 */
export class StructuredLogger extends MedusaLogger {
  constructor(pinoInstance: PinoLogger) {
    super(pinoInstance)
  }

  /**
   * Get the underlying Pino logger for advanced usage
   */
  get pino(): PinoLogger {
    return this._pinoLogger
  }

  /**
   * Log with structured context
   *
   * @example
   * logger.infoWithContext({ orderId: "123" }, "Order created")
   */
  infoWithContext(context: Record<string, unknown>, message: string): void {
    this._pinoLogger.info(context, message)
  }

  warnWithContext(context: Record<string, unknown>, message: string): void {
    this._pinoLogger.warn(context, message)
  }

  errorWithContext(
    context: Record<string, unknown>,
    message: string,
    error?: Error
  ): void {
    if (error) {
      this._pinoLogger.error(
        { ...context, err: error, errorMessage: error.message },
        message
      )
    } else {
      this._pinoLogger.error(context, message)
    }
  }

  debugWithContext(context: Record<string, unknown>, message: string): void {
    this._pinoLogger.debug(context, message)
  }

  /**
   * Create a child logger with bound context
   *
   * @example
   * const orderLogger = logger.child({ module: "orders", orderId: "123" })
   * orderLogger.info("Processing order") // includes module and orderId
   */
  child(bindings: Record<string, unknown>): StructuredLogger {
    return new StructuredLogger(this._pinoLogger.child(bindings))
  }
}

// Create and export the main logger instance
export const logger = new StructuredLogger(pinoLogger)

/**
 * Create a child logger with pre-bound context
 *
 * @example
 * const webhookLogger = createChildLogger({ module: "webhooks", source: "stripe" })
 */
export function createChildLogger(
  bindings: Record<string, unknown>
): StructuredLogger {
  return logger.child(bindings)
}

/**
 * Generate a unique correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

// Export the logger instance for Medusa config
export default logger
