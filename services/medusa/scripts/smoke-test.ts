#!/usr/bin/env tsx
/**
 * Medusa Smoke Test Suite
 *
 * Comprehensive end-to-end test that validates the entire Medusa stack.
 * Combines infrastructure checks, API tests, and data validation.
 *
 * Test Coverage:
 * - Database connection and schema
 * - Redis connection and auth
 * - Admin API accessibility and auth
 * - Store API accessibility with publishable key
 * - Sample product CRUD operations
 * - Sales channel configuration
 *
 * Usage:
 *   pnpm run test:smoke
 *   pnpm run test:smoke --verbose  # Show detailed output
 */

import "dotenv/config"
import { retryFetch, waitForService } from "./utils/retry.js"

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

const results: TestResult[] = []
let verbose = false

/**
 * Run a test and track results
 */
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now()

  try {
    await testFn()
    const duration = Date.now() - start

    results.push({
      name,
      passed: true,
      message: 'Passed',
      duration,
    })

    if (verbose) {
      console.log(`✓ ${name} (${duration}ms)`)
    }
  } catch (error) {
    const duration = Date.now() - start
    const message = error instanceof Error ? error.message : String(error)

    results.push({
      name,
      passed: false,
      message,
      duration,
    })

    if (verbose) {
      console.error(`✗ ${name} (${duration}ms)`)
      console.error(`  ${message}`)
    }
  }
}

/**
 * Test 1: PostgreSQL Connection
 */
async function testPostgresConnection(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured')
  }

  const { Client } = await import('pg')
  const client = new Client({ connectionString: process.env.DATABASE_URL })

  await client.connect()

  // Check if Medusa tables exist
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('product', 'sales_channel', 'publishable_api_key')
  `)

  if (result.rows.length < 3) {
    throw new Error('Medusa schema not fully migrated')
  }

  await client.end()
}

/**
 * Test 2: Redis Connection
 */
async function testRedisConnection(): Promise<void> {
  if (!process.env.REDIS_URL) {
    // Redis is optional, skip test
    return
  }

  const { createClient } = await import('redis')
  const client = createClient({ url: process.env.REDIS_URL })

  await client.connect()

  // Test set/get
  await client.set('smoke_test_key', 'smoke_test_value', { EX: 10 })
  const value = await client.get('smoke_test_key')

  if (value !== 'smoke_test_value') {
    throw new Error('Redis set/get test failed')
  }

  await client.del('smoke_test_key')
  await client.quit()
}

/**
 * Test 3: Admin API Health
 */
async function testAdminAPIHealth(): Promise<void> {
  const baseUrl = process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

  const response = await retryFetch(
    `${baseUrl}/health`,
    {},
    { maxAttempts: 3 }
  )

  if (!response.ok) {
    throw new Error(`Health check failed: HTTP ${response.status}`)
  }
}

/**
 * Test 4: Admin API Authentication
 */
async function testAdminAPIAuth(): Promise<void> {
  const baseUrl = process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const token = process.env.MEDUSA_ADMIN_TOKEN

  if (!token) {
    throw new Error('MEDUSA_ADMIN_TOKEN not configured')
  }

  const response = await retryFetch(
    `${baseUrl}/admin/sales-channels`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    { maxAttempts: 3 }
  )

  if (!response.ok) {
    throw new Error(`Admin API auth failed: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.sales_channels || data.sales_channels.length === 0) {
    throw new Error('No sales channels found')
  }
}

/**
 * Test 5: Store API Accessibility
 */
async function testStoreAPIAccess(): Promise<void> {
  const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

  const response = await retryFetch(
    `${baseUrl}/store/products`,
    {
      headers: process.env.MEDUSA_PUBLISHABLE_KEY
        ? { 'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY }
        : {},
    },
    { maxAttempts: 3 }
  )

  if (response.status === 401) {
    throw new Error('Store API requires publishable key (run: pnpm run setup:keys)')
  }

  if (!response.ok) {
    throw new Error(`Store API failed: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!Array.isArray(data.products)) {
    throw new Error('Invalid Store API response format')
  }
}

/**
 * Test 6: Product CRUD Operations
 */
async function testProductCRUD(): Promise<void> {
  const baseUrl = process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const token = process.env.MEDUSA_ADMIN_TOKEN

  if (!token) {
    throw new Error('MEDUSA_ADMIN_TOKEN not configured')
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Get sales channel
  const channelsRes = await retryFetch(
    `${baseUrl}/admin/sales-channels?limit=1`,
    { headers },
    { maxAttempts: 3 }
  )

  if (!channelsRes.ok) {
    throw new Error('Failed to fetch sales channel')
  }

  const channelsData = await channelsRes.json()
  const salesChannelId = channelsData.sales_channels?.[0]?.id

  if (!salesChannelId) {
    throw new Error('No sales channel available')
  }

  // Create test product
  const createRes = await retryFetch(
    `${baseUrl}/admin/products`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Smoke Test Product',
        handle: 'smoke-test-product-' + Date.now(),
        status: 'draft',
        sales_channels: [{ id: salesChannelId }],
        variants: [
          {
            title: 'Default',
            prices: [{ currency_code: 'usd', amount: 1000 }],
          },
        ],
      }),
    },
    { maxAttempts: 3 }
  )

  if (!createRes.ok) {
    const text = await createRes.text()
    throw new Error(`Failed to create product: ${text}`)
  }

  const createData = await createRes.json()
  const productId = createData.product?.id

  if (!productId) {
    throw new Error('Product creation did not return ID')
  }

  // Clean up - delete test product
  const deleteRes = await retryFetch(
    `${baseUrl}/admin/products/${productId}`,
    {
      method: 'DELETE',
      headers,
    },
    { maxAttempts: 3 }
  )

  if (!deleteRes.ok) {
    throw new Error('Failed to delete test product')
  }
}

/**
 * Display test results
 */
function displayResults(): void {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 Smoke Test Results')
  console.log('='.repeat(70))

  for (const result of results) {
    const icon = result.passed ? '✓' : '✗'
    const color = result.passed ? '\x1b[32m' : '\x1b[31m'
    const reset = '\x1b[0m'

    console.log(`${color}${icon}${reset} ${result.name.padEnd(40)} ${result.duration}ms`)

    if (!result.passed) {
      console.log(`  ${result.message}`)
    }
  }

  console.log('='.repeat(70))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log(`\nSummary: ${passed}/${total} tests passed, ${failed} failed\n`)

  if (failed > 0) {
    console.log('❌ Smoke tests failed. Review errors above.\n')
    process.exit(1)
  } else {
    console.log('✅ All smoke tests passed! Medusa stack is healthy.\n')
    process.exit(0)
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🧪 Medusa Smoke Test Suite\n')

  const args = process.argv.slice(2)
  verbose = args.includes('--verbose')

  if (!verbose) {
    console.log('Running tests...')
  }

  try {
    // Infrastructure tests
    await runTest('PostgreSQL Connection', testPostgresConnection)
    await runTest('Redis Connection', testRedisConnection)

    // API tests
    await runTest('Admin API Health Check', testAdminAPIHealth)
    await runTest('Admin API Authentication', testAdminAPIAuth)
    await runTest('Store API Accessibility', testStoreAPIAccess)

    // Data operation tests
    await runTest('Product CRUD Operations', testProductCRUD)

    // Display results
    displayResults()
  } catch (error) {
    console.error('\n❌ Smoke test suite failed:', error)
    process.exit(1)
  }
}

main()
