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
 * Logging:
 *   PM2 captures pnpm wrapper output but NOT Medusa application logs.
 *   We set LOG_FILE env var so Medusa writes logs to a file directly.
 *   View Medusa application logs: tail -f ./logs/medusa-app.log
 *   View PM2 wrapper logs: pm2 logs medusa-prod
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
    // Medusa's LOG_FILE ensures application logs are captured
    // PM2 only captures pnpm wrapper stdout, not Medusa's internal logger
    LOG_FILE: './logs/medusa-app.log',
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
    // Medusa's LOG_FILE ensures application logs are captured
    // PM2 only captures pnpm wrapper stdout, not Medusa's internal logger
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
