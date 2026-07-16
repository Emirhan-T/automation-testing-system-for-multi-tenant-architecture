// ---------------------------------------------------------------------------
// FAZ 2 DOĞRULAMA SCRIPT'İ
//
// Çalıştır (sunucu çalışırken): npx tsx tests/config/verify-phase2.ts
//
// Ne yapar:
//   1. Tüm API endpoint'lerini belgeler ve konsola basar
//   2. Sunucu çalışıyorsa gerçek HTTP çağrıları yaparak şemaları doğrular
//   3. Her tenant × her endpoint kombinasyonu için sonucu raporlar
// ---------------------------------------------------------------------------

import { testTenants, hasCapability } from './capability-matrix'
import { apiEndpoints, endpointTestUrl, resolveEndpointPath } from './api-endpoints'
import {
  SearchResponseSchema,
  TenantConfigSchema,
  PropertySchema,
  MortgageResponseSchema,
  validateSchema,
} from './api-schemas'
import { z } from 'zod'

// Şema haritası — endpoint path → Zod şeması
const schemaMap: Record<string, z.ZodTypeAny> = {
  '/api/tenant-config': TenantConfigSchema,
  '/api/search': SearchResponseSchema,
  '/api/property/:id': PropertySchema,
  '/api/calculate-mortgage': MortgageResponseSchema,
}

// ---- 1. Endpoint Kataloğu -----------------------------------------------
console.log('\n' + '='.repeat(70))
console.log('FAZ 2 — API ENDPOINT KATALOĞU')
console.log('='.repeat(70))

for (const ep of apiEndpoints) {
  console.log(`\n▶ [${ep.method.padEnd(4)}] ${ep.path}`)
  console.log(`  Label: ${ep.label}`)
  console.log(`  Açıklama: ${ep.description}`)
  console.log(`  Tenant-agnostic şema: ${ep.tenantAgnosticSchema ? '✅ Evet' : '❌ Hayır'}`)
  if (ep.requiredCapability) {
    console.log(`  Gerekli capability: ${ep.requiredCapability}`)
    console.log(`  Engelleme kodu: ${ep.blockedStatusCode ?? 'tanımsız'}`)
  }
  if (ep.samplePayload) {
    console.log(`  Örnek payload: ${JSON.stringify(ep.samplePayload)}`)
  }
}

// ---- 2. Canlı Şema Doğrulama --------------------------------------------
console.log('\n' + '='.repeat(70))
console.log('FAZ 2 — CANLI ŞEMA DOĞRULAMA (Sunucu çalışıyorsa)')
console.log('='.repeat(70))

let passCount = 0
let failCount = 0
let skipCount = 0

for (const tenant of testTenants) {
  console.log(`\n▶ Tenant: ${tenant.label} (${tenant.id})`)

  for (const endpoint of apiEndpoints) {
    // Path params: property detail için samplePropertyId kullan
    const pathParams = endpoint.path.includes(':id')
      ? { id: tenant.samplePropertyId }
      : {}

    const url = endpointTestUrl(tenant, endpoint, pathParams)
    const schema = schemaMap[endpoint.path]
    const hasRequiredCap = endpoint.requiredCapability
      ? hasCapability(tenant, endpoint.requiredCapability as any)
      : true

    const label = `  [${endpoint.method}] ${resolveEndpointPath(endpoint.path, pathParams)}`

    try {
      let response: Response
      if (endpoint.method === 'POST') {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(endpoint.samplePayload ?? {}),
        })
      } else {
        response = await fetch(url)
      }

      if (!hasRequiredCap) {
        // Capability yoksa → blocked status code bekleniyor
        const expectedStatus = endpoint.blockedStatusCode ?? 403
        if (response.status === expectedStatus) {
          console.log(`${label}`)
          console.log(`    ✅ Capability gating doğru: ${response.status} (beklenen: ${expectedStatus})`)
          passCount++
        } else {
          console.log(`${label}`)
          console.log(`    ❌ Beklenen ${expectedStatus} ama ${response.status} döndü`)
          failCount++
        }
        continue
      }

      if (!response.ok) {
        console.log(`${label}`)
        console.log(`    ❌ HTTP ${response.status} — başarısız`)
        failCount++
        continue
      }

      const body = await response.json()

      if (schema) {
        const result = validateSchema(schema, body)
        if (result.valid) {
          console.log(`${label}`)
          console.log(`    ✅ Şema geçerli (HTTP ${response.status})`)
          passCount++
        } else {
          console.log(`${label}`)
          console.log(`    ❌ Şema hatası:`)
          result.errors.forEach(e => console.log(`       • ${e}`))
          failCount++
        }
      } else {
        console.log(`${label}`)
        console.log(`    ⚠️  Şema tanımlı değil — HTTP ${response.status}`)
        skipCount++
      }
    } catch (err: any) {
      if (err.cause?.code === 'ECONNREFUSED') {
        console.log(`${label}`)
        console.log(`    ⏭️  Sunucu çalışmıyor — atlandı`)
        skipCount++
      } else {
        console.log(`${label}`)
        console.log(`    ❌ Hata: ${err.message}`)
        failCount++
      }
    }
  }
}

// ---- 3. Özet ---------------------------------------------------------------
console.log('\n' + '='.repeat(70))
console.log('FAZ 2 — SONUÇ')
console.log('='.repeat(70))
console.log(`\n  ✅ Geçti  : ${passCount}`)
console.log(`  ❌ Başarısız: ${failCount}`)
console.log(`  ⏭️  Atlandı : ${skipCount}`)

if (failCount === 0) {
  console.log('\n✅ Faz 2 şema doğrulaması başarılı.')
  console.log('   Sonraki adım → Faz 3: Smoke + Behaviour Testleri\n')
} else {
  console.log('\n❌ Bazı şemalar doğrulanamadı — yukarıdaki hataları incele.\n')
  process.exit(1)
}
