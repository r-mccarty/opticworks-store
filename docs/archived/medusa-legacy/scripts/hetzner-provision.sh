#!/bin/bash
#
# Hetzner Node Provisioning Script
#
# Provisions PostgreSQL and Redis for Medusa on Hetzner remote node.
# This script is designed to be run with sudo privileges on the remote host.
#
# Usage:
#   Local (generate credentials first):
#     pnpm run generate:secrets > /tmp/medusa-secrets.env
#     source /tmp/medusa-secrets.env
#     ssh hetzner-node 'bash -s' < scripts/hetzner-provision.sh
#
#   Or pass credentials as environment variables:
#     POSTGRES_PASSWORD=xxx REDIS_PASSWORD=xxx ssh hetzner-node 'bash -s' < scripts/hetzner-provision.sh
#
# Required environment variables:
#   POSTGRES_PASSWORD - Password for the medusa_user PostgreSQL account
#   REDIS_PASSWORD    - Password for Redis authentication
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate required environment variables
if [ -z "${POSTGRES_PASSWORD:-}" ]; then
    log_error "POSTGRES_PASSWORD environment variable is required"
    exit 1
fi

if [ -z "${REDIS_PASSWORD:-}" ]; then
    log_error "REDIS_PASSWORD environment variable is required"
    exit 1
fi

# Configuration
POSTGRES_USER="medusa_user"
POSTGRES_DB="medusa_db"
REDIS_CONF="/etc/redis/redis.conf"

log_info "Starting Hetzner node provisioning for Medusa infrastructure..."

#
# PostgreSQL Setup
#
log_info "Checking PostgreSQL installation..."

if ! command -v psql &> /dev/null; then
    log_warn "PostgreSQL not found. Installing PostgreSQL 15..."
    sudo apt-get update
    sudo apt-get install -y postgresql-15 postgresql-contrib-15
    log_info "PostgreSQL 15 installed successfully"
else
    PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
    log_info "PostgreSQL $PG_VERSION already installed"
fi

# Ensure PostgreSQL is running
log_info "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create Medusa database and user (idempotent)
log_info "Configuring PostgreSQL database and user..."

sudo -u postgres psql <<SQL
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$POSTGRES_USER') THEN
        CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
    ELSE
        ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
SQL

log_info "PostgreSQL user '$POSTGRES_USER' and database '$POSTGRES_DB' configured"

# Configure PostgreSQL to accept password authentication from localhost
log_info "Configuring PostgreSQL authentication..."

PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if [ -f "$PG_HBA" ]; then
    # Backup original
    sudo cp "$PG_HBA" "$PG_HBA.backup.$(date +%Y%m%d_%H%M%S)"

    # Ensure local connections use md5 password auth
    if ! sudo grep -q "^host.*$POSTGRES_DB.*$POSTGRES_USER.*md5" "$PG_HBA"; then
        echo "host    $POSTGRES_DB    $POSTGRES_USER    127.0.0.1/32    md5" | sudo tee -a "$PG_HBA" > /dev/null
        log_info "Added password authentication rule for $POSTGRES_USER"

        # Reload PostgreSQL
        sudo systemctl reload postgresql
    else
        log_info "PostgreSQL authentication already configured"
    fi
else
    log_warn "PostgreSQL pg_hba.conf not found at $PG_HBA"
fi

#
# Redis Setup
#
log_info "Checking Redis installation..."

if ! command -v redis-cli &> /dev/null; then
    log_warn "Redis not found. Installing Redis..."
    sudo apt-get update
    sudo apt-get install -y redis-server
    log_info "Redis installed successfully"
else
    REDIS_VERSION=$(redis-cli --version | awk '{print $2}' | cut -d= -f2)
    log_info "Redis $REDIS_VERSION already installed"
fi

# Ensure Redis is running
log_info "Starting Redis service..."
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Configure Redis password
log_info "Configuring Redis authentication..."

if [ -f "$REDIS_CONF" ]; then
    # Backup original
    sudo cp "$REDIS_CONF" "$REDIS_CONF.backup.$(date +%Y%m%d_%H%M%S)"

    # Set requirepass
    if sudo grep -q "^requirepass" "$REDIS_CONF"; then
        sudo sed -i "s/^requirepass.*/requirepass $REDIS_PASSWORD/" "$REDIS_CONF"
        log_info "Updated Redis password"
    else
        echo "requirepass $REDIS_PASSWORD" | sudo tee -a "$REDIS_CONF" > /dev/null
        log_info "Added Redis password"
    fi

    # Restart Redis to apply changes
    sudo systemctl restart redis-server
else
    log_warn "Redis configuration file not found at $REDIS_CONF"
fi

#
# Verification
#
log_info "Verifying configuration..."

# Test PostgreSQL connection
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" &> /dev/null; then
    log_info "✓ PostgreSQL connection successful"
else
    log_error "✗ PostgreSQL connection failed"
    exit 1
fi

# Test Redis connection
if redis-cli -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
    log_info "✓ Redis connection successful"
else
    log_error "✗ Redis connection failed"
    exit 1
fi

#
# Output connection strings
#
log_info "Provisioning complete! Use these connection strings in your .env file:"
echo ""
echo "DATABASE_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
echo "REDIS_URL=redis://:$REDIS_PASSWORD@localhost:6379"
echo ""
log_info "Store these credentials in Infisical and update your .env file"
