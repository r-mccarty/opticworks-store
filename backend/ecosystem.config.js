/**
 * PM2 Ecosystem Configuration for Medusa Backend
 *
 * Standard Medusa project deployment configuration.
 * Provides process supervision for both development and production environments.
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env development  # Start in dev mode
 *   pm2 start ecosystem.config.js --env production   # Start in prod mode
 *   pm2 logs medusa                                  # View logs
 *   pm2 stop all                                     # Stop all processes
 *   pm2 monit                                        # Monitor processes
 *
 * Logging (Structured JSON via Pino):
 *   Development: Pretty-printed colored logs to stdout
 *   Production: JSON format to stdout AND file (for log aggregation)
 *
 *   Environment variables:
 *   - LOG_LEVEL: debug|info|warn|error (default: debug in dev, info in prod)
 *   - LOG_FILE: Path to write JSON logs (production only)
 *
 *   View logs:
 *   - Development: pnpm dev (pretty-printed in terminal)
 *   - Production JSON: tail -f ./logs/medusa-app.log | pnpm pino-pretty
 *   - PM2 wrapper logs: pm2 logs medusa-prod
 *
 * Log format (production):
 *   {"level":30,"time":"2024-01-15T10:30:00.000Z","service":"medusa-backend",
 *    "correlationId":"abc123","method":"POST","path":"/store/carts","msg":"Request"}
 *
 * Reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
 * Medusa logging: https://docs.medusajs.com/learn/debugging-and-testing/logging
 */

const isProductionTarget = process.env.PM2_TARGET === 'production';

const devProcess = {
  name: 'medusa-dev',
  script: 'pnpm',
  args: 'dev',
  cwd: __dirname,
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'development',
    // Development: Pretty-printed logs to stdout (no file)
    LOG_LEVEL: 'debug',
  },
  // Restart configuration for handling crashes
  min_uptime: '30s',
  max_restarts: 3,
  restart_delay: 5000,
  exp_backoff_restart_delay: 1000,
  // Error handling
  error_file: './logs/pm2-error.log',
  out_file: './logs/pm2-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true,
  // Stop gracefully
  kill_timeout: 5000,
  wait_ready: false,
  listen_timeout: 10000,
};

const prodProcess = {
  name: 'medusa-prod',
  script: 'pnpm',
  args: 'start',
  cwd: __dirname,
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '2G',
  env: {
    NODE_ENV: 'production',
    // Production: JSON logs to stdout + file for log aggregation
    LOG_LEVEL: 'info',
    LOG_FILE: './logs/medusa-app.log',
  },
  // Production restart configuration (more conservative)
  min_uptime: '30s',
  max_restarts: 5,
  restart_delay: 5000,
  exp_backoff_restart_delay: 500,
  // Error handling
  error_file: './logs/pm2-prod-error.log',
  out_file: './logs/pm2-prod-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true,
  // Stop gracefully
  kill_timeout: 10000,
  wait_ready: false,
  listen_timeout: 30000,
};

module.exports = {
  apps: isProductionTarget ? [prodProcess] : [devProcess, prodProcess],
};
