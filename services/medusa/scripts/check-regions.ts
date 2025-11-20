#!/usr/bin/env tsx
import "dotenv/config"

const BASE_URL = process.env.MEDUSA_BACKEND_URL || "https://api.optic.works"
const SECRET_KEY = process.env.MEDUSA_SECRET_KEY

async function checkRegions() {
  const response = await fetch(`${BASE_URL}/admin/regions`, {
    headers: {
      'Authorization': `Basic ${SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  const data = await response.json()

  if (data.regions && data.regions.length > 0) {
    console.log(`✅ Found ${data.regions.length} regions:`)
    data.regions.forEach((r: any) => {
      const countries = r.countries?.length || 0
      console.log(`  - ${r.name} (${r.currency_code}): ${countries} countries`)
    })
  } else {
    console.log('❌ No regions configured!')
    console.log('This is required for cart/checkout functionality.')
    console.log('\nRegions must be created via Medusa Admin dashboard at:')
    console.log('https://api.optic.works/app')
  }
}

checkRegions()
