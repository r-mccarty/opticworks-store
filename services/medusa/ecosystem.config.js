/**
 * PM2 Ecosystem Configuration for Medusa Service
 *
 * Provides process supervision to handle esbuild crashes during development.
 * Automatically restarts the service when it crashes, keeping it available.
 *
 * Usage:
 *   pnpm run dev:pm2       # Start with PM2
 *   pnpm run logs:pm2      # View logs
 *   pnpm run stop:pm2      # Stop service
 *   pm2 monit              # Monitor all processes
 *
 * Reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
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
  },
  // Restart configuration for handling crashes (updated to prevent CPU spikes)
  min_uptime: '30s', // Consider app started after 30s uptime
  max_restarts: 3, // Max 3 restarts within 1 min (reduced from 10 to prevent crash loops)
  restart_delay: 5000, // Wait 5s before restart (increased from 2s)
  exp_backoff_restart_delay: 1000, // Exponential backoff starting at 1s (increased from 100ms)
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
