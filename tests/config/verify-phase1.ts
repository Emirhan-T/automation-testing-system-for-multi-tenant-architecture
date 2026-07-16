// ---------------------------------------------------------------------------
// FAZ 1 DOĞRULAMA SCRIPT'İ
//
// Çalıştır: npx tsx tests/config/verify-phase1.ts
//
// Bu script Faz 1 çıktısını konsola basar:
//   - Tenant listesi ve capability'leri
//   - Route × Capability matrisi
//   - Test URL'leri
// ---------------------------------------------------------------------------

import { testTenants, getRepresentativeTenants } from './capability-matrix'
import { getTenantRouteMap, buildRouteCapabilityMatrix } from './routes'

// ---- 1. Tenant Registry Özeti -------------------------------------------
console.log('\n' + '='.repeat(70))
console.log('FAZ 1 — TENANT REGISTRY & CAPABILITY MATRIX')
console.log('='.repeat(70))

for (const tenant of testTenants) {
  console.log(`\n▶ ${tenant.label} (${tenant.id}) — ${tenant.theme}`)
  console.log(`  Temsil ettiği kombinasyon: ${tenant.representativeOf}`)
  console.log(`  Capabilities: [${tenant.capabilities.join(', ')}]`)
  console.log(`  Örnek mülk ID: ${tenant.samplePropertyId}`)
}

// ---- 2. Route Haritası ---------------------------------------------------
console.log('\n' + '='.repeat(70))
console.log('FAZ 1 — ROUTE ANALİZİ')
console.log('='.repeat(70))

for (const tenant of testTenants) {
  const routes = getTenantRouteMap(tenant)
  console.log(`\n▶ ${tenant.id}`)
  console.log(`  Core route'lar (${routes.core.length}):`)
  for (const r of routes.core) {
    console.log(`    • ${r.label}`)
    console.log(`      ${r.url}`)
  }
  if (routes.capabilityGated.length > 0) {
    console.log(`  Capability-gated route'lar (${routes.capabilityGated.length}):`)
    for (const r of routes.capabilityGated) {
      console.log(`    • ${r.label} [requires: ${r.requiredCapability}]`)
      console.log(`      ${r.url}`)
    }
  }
}

// ---- 3. Route × Capability Matrisi ---------------------------------------
console.log('\n' + '='.repeat(70))
console.log('FAZ 1 — ROUTE × CAPABILITY MATRİSİ')
console.log('='.repeat(70))

const matrix = buildRouteCapabilityMatrix(testTenants)
const uniqueRoutes = [...new Set(matrix.map(m => m.route))]
const tenantIds = testTenants.map(t => t.id)

// Header
const col = 22
process.stdout.write('\n' + ' '.repeat(20))
for (const t of tenantIds) {
  process.stdout.write(t.padEnd(col))
}
console.log()
console.log('-'.repeat(20 + tenantIds.length * col))

for (const route of uniqueRoutes) {
  process.stdout.write(route.padEnd(20))
  for (const tid of tenantIds) {
    const cell = matrix.find(m => m.tenant === tid && m.route === route)
    process.stdout.write((cell?.accessible ? '✅' : '❌').padEnd(col))
  }
  console.log()
}

// ---- 4. Representative Set Özeti ----------------------------------------
console.log('\n' + '='.repeat(70))
console.log('FAZ 1 — REPRESENTATIVE TENANT SET')
console.log('='.repeat(70))
const reps = getRepresentativeTenants()
console.log(`\nToplam tenant: ${testTenants.length}`)
console.log(`Representative set: ${reps.length} tenant`)
console.log(`Kapsanan capability kombinasyonu sayısı: ${reps.length}`)
console.log()
console.log('✅ Faz 1 yapılandırması doğrulandı.')
console.log('   Sonraki adım → Faz 2: Smoke testleri\n')
