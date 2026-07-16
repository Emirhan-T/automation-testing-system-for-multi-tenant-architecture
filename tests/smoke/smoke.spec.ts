// ---------------------------------------------------------------------------
// FAZ 3 — SMOKE TESTS
//
// Amaç: Her tenant'ta core sayfaların yüklendiğini doğrular.
//
// Soru: "Uygulama ayakta mı? Temel sayfalar erişilebilir mi?"
//
// Çalıştır: npx playwright test tests/smoke/
// ---------------------------------------------------------------------------

import { test, expect } from '@playwright/test'
import { testTenants, tenantUrl } from '../config/capability-matrix'

for (const tenant of testTenants) {
  test.describe(`[Smoke] ${tenant.label} (${tenant.id})`, () => {

    // ── Ana Sayfa ────────────────────────────────────────────────────────────
    test('ana sayfa 200 ile yüklenir', async ({ page }) => {
      const response = await page.goto(tenantUrl(tenant, '/'))
      expect(response?.status()).toBe(200)
    })

    test('doğru tema class\'ı uygulanmış', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const root = page.locator('[data-testid="tenant-root"]')
      await expect(root).toBeVisible()
      await expect(root).toHaveClass(new RegExp(tenant.theme))
    })

    test('tenant ID attribute\'u doğru', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const root = page.locator('[data-testid="tenant-root"]')
      await expect(root).toHaveAttribute('data-tenant-id', tenant.id)
    })

    test('logo görünür', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const logo = page.locator('[data-testid="site-logo"]')
      await expect(logo).toBeVisible()
      await expect(logo).not.toBeEmpty()
    })

    test('arama formu yüklendi', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await expect(page.locator('[data-testid="search-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="search-submit"]')).toBeVisible()
    })

    test('mülk listesi en az 1 sonuç içeriyor', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const results = page.locator('[data-testid="search-results-item"]')
      await expect(results.first()).toBeVisible()
      const count = await results.count()
      expect(count).toBeGreaterThan(0)
    })

    // ── Property Detail ──────────────────────────────────────────────────────
    test('property detail sayfası 200 ile yüklenir', async ({ page }) => {
      const response = await page.goto(
        tenantUrl(tenant, `/property/${tenant.samplePropertyId}`)
      )
      expect(response?.status()).toBe(200)
    })

    test('property detail içerik alanları görünür', async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await expect(page.locator('[data-testid="property-detail-page"]')).toBeVisible()
      await expect(page.locator('[data-testid="property-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="property-price"]')).toBeVisible()
    })

  })
}
