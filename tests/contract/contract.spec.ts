// ---------------------------------------------------------------------------
// FAZ 8 — CONTRACT TESTS
//
// Amaç: Tüm API endpoint'lerinin tenant fark etmeksizin aynı şemayı
//       döndürdüğünü ve capability-gating'in API seviyesinde çalıştığını
//       doğrular.
//
// Soru: "API sözleşmesi bozuldu mu?"
//       "Şema alanları kayboldu mu, tip değişti mi?"
//       "Capability gating API katmanında da aktif mi?"
//
// Bu testler Playwright'ın `request` fixture'ını kullanır — tarayıcı
// açmadan doğrudan HTTP çağrısı yapar (hız odaklı).
//
// Çalıştır: npx playwright test tests/contract/
// ---------------------------------------------------------------------------

import { test, expect } from '@playwright/test'
import { testTenants, hasCapability } from '../config/capability-matrix'
import {
  SearchResponseSchema,
  TenantConfigSchema,
  PropertySchema,
  MortgageResponseSchema,
  validateSchema,
} from '../config/api-schemas'

const BASE = 'http://localhost:3000'

// Her tenant için x-tenant header'ı ile istek yapan yardımcı fonksiyon
function tenantFetch(request: Parameters<Parameters<typeof test>[1]>[0]['request'], tenantId: string) {
  return {
    get: (path: string, params?: Record<string, string>) => {
      const url = new URL(path, BASE)
      if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
      return request.get(url.toString(), {
        headers: { 'x-tenant': tenantId },
      })
    },
    post: (path: string, body: unknown) =>
      request.post(`${BASE}${path}`, {
        headers: {
          'x-tenant': tenantId,
          'Content-Type': 'application/json',
        },
        data: body,
      }),
  }
}

// ============================================================================
// GET /api/tenant-config — Her tenant için şema sabit kalmalı
// ============================================================================

test.describe('[Contract] GET /api/tenant-config', () => {
  for (const tenant of testTenants) {
    test(`[${tenant.id}] TenantConfig şemasına uyuyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.get('/api/tenant-config')

      expect(res.status()).toBe(200)
      const body = await res.json()

      const result = validateSchema(TenantConfigSchema, body)
      expect(result.valid, `Şema hataları: ${!result.valid ? result.errors.join(', ') : ''}`).toBe(true)
    })

    test(`[${tenant.id}] doğru tenant verisini döndürüyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.get('/api/tenant-config')
      const body = await res.json()

      expect(body.id).toBe(tenant.id)
      expect(body.theme).toBe(tenant.theme)
      expect(body.capabilities).toEqual(expect.arrayContaining(tenant.capabilities))
    })
  }
})

// ============================================================================
// GET /api/search — Tüm tenant'larda aynı şema, filtre çalışıyor
// ============================================================================

test.describe('[Contract] GET /api/search', () => {
  for (const tenant of testTenants) {
    test(`[${tenant.id}] SearchResponse şemasına uyuyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.get('/api/search')

      expect(res.status()).toBe(200)
      const body = await res.json()

      const result = validateSchema(SearchResponseSchema, body)
      expect(result.valid, `Şema hataları: ${!result.valid ? result.errors.join(', ') : ''}`).toBe(true)
    })

    test(`[${tenant.id}] totalCount results dizisi uzunluğuyla eşleşiyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.get('/api/search')
      const body = await res.json()

      expect(body.totalCount).toBe(body.results.length)
    })

    test(`[${tenant.id}] ?city filtresi sonuçları kısaltıyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)

      const allRes = await api.get('/api/search')
      const allBody = await allRes.json()

      // ASCII 'Istanbul' kullan — Türkçe İ toLowerCase() sorunu yaşanmaz
      const filteredRes = await api.get('/api/search', { city: 'Istanbul' })
      const filteredBody = await filteredRes.json()

      expect(filteredBody.results.length).toBeLessThan(allBody.results.length)
      // 'stanbul' ile kontrol — baş harf locale sorununu atla
      for (const p of filteredBody.results) {
        expect(p.city.toLowerCase()).toContain('stanbul')
      }
    })
  }
})

// ============================================================================
// GET /api/property/:id — Tekil mülk şeması
// ============================================================================

test.describe('[Contract] GET /api/property/:id', () => {
  for (const tenant of testTenants) {
    test(`[${tenant.id}] Property şemasına uyuyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.get(`/api/property/${tenant.samplePropertyId}`)

      expect(res.status()).toBe(200)
      const body = await res.json()

      const result = validateSchema(PropertySchema, body)
      expect(result.valid, `Şema hataları: ${!result.valid ? result.errors.join(', ') : ''}`).toBe(true)
    })

    test(`[${tenant.id}] doğru property ID'sini döndürüyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.get(`/api/property/${tenant.samplePropertyId}`)
      const body = await res.json()

      expect(body.id).toBe(tenant.samplePropertyId)
      expect(body.price).toBeGreaterThan(0)
      expect(body.bedrooms).toBeGreaterThanOrEqual(0)
    })

    test(`[${tenant.id}] geçersiz ID için 404 döner`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.get('/api/property/GECERSIZ_ID_12345')

      expect(res.status()).toBe(404)
    })
  }
})

// ============================================================================
// POST /api/calculate-mortgage — Capability-gating + şema doğrulama
// ============================================================================

const MORTGAGE_PAYLOAD = { price: 5_000_000, deposit: 1_000_000, years: 25 }

test.describe('[Contract] POST /api/calculate-mortgage — CAPABILITY VAR', () => {
  for (const tenant of testTenants.filter(t => hasCapability(t, 'mortgage_calculator'))) {
    test(`[${tenant.id}] MortgageResponse şemasına uyuyor`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.post('/api/calculate-mortgage', MORTGAGE_PAYLOAD)

      expect(res.status()).toBe(200)
      const body = await res.json()

      const result = validateSchema(MortgageResponseSchema, body)
      expect(result.valid, `Şema hataları: ${!result.valid ? result.errors.join(', ') : ''}`).toBe(true)
    })

    test(`[${tenant.id}] hesaplanan taksit mantıklı aralıkta`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.post('/api/calculate-mortgage', MORTGAGE_PAYLOAD)
      const body = await res.json()

      // 4M TL, 25 yıl, %3.5 faiz — aylık taksit ~20.000 ₺ civarında bekleniyor
      expect(body.monthlyPayment).toBeGreaterThan(10_000)
      expect(body.monthlyPayment).toBeLessThan(200_000)
      expect(body.principal).toBe(4_000_000) // 5M - 1M
      expect(body.years).toBe(25)
    })
  }
})

test.describe('[Contract] POST /api/calculate-mortgage — CAPABILITY YOK (403)', () => {
  for (const tenant of testTenants.filter(t => !hasCapability(t, 'mortgage_calculator'))) {
    test(`[${tenant.id}] 403 Forbidden döner`, async ({ request }) => {
      const api = tenantFetch(request, tenant.id)
      const res = await api.post('/api/calculate-mortgage', MORTGAGE_PAYLOAD)

      expect(res.status()).toBe(403)
    })
  }
})

// ============================================================================
// Şema tutarlılığı: Tenant fark etmeksizin alanlar kaybolmuyor
// ============================================================================

test.describe('[Contract] Şema tutarlılığı — tenant bağımsız', () => {
  test('search response tüm tenant\'larda aynı alan setine sahip', async ({ request }) => {
    const results = await Promise.all(
      testTenants.map(async tenant => {
        const api = tenantFetch(request, tenant.id)
        const res = await api.get('/api/search')
        return { tenant: tenant.id, body: await res.json() }
      })
    )

    // Tüm tenant'lardaki results'taki her mülk aynı şemayı taşımalı
    for (const { tenant, body } of results) {
      const validation = validateSchema(SearchResponseSchema, body)
      expect(
        validation.valid,
        `[${tenant}] şema hatası: ${!validation.valid ? validation.errors.join(', ') : ''}`
      ).toBe(true)
    }
  })

  test('tenant-config tüm tenant\'larda aynı alan setine sahip', async ({ request }) => {
    const results = await Promise.all(
      testTenants.map(async tenant => {
        const api = tenantFetch(request, tenant.id)
        const res = await api.get('/api/tenant-config')
        return { tenant: tenant.id, body: await res.json() }
      })
    )

    for (const { tenant, body } of results) {
      const validation = validateSchema(TenantConfigSchema, body)
      expect(
        validation.valid,
        `[${tenant}] şema hatası: ${!validation.valid ? validation.errors.join(', ') : ''}`
      ).toBe(true)
    }
  })
})
