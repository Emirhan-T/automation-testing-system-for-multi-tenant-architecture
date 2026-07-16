// ---------------------------------------------------------------------------
// FAZ 5 — HYDRATION TESTS
//
// Amaç: SSR → Client hydration geçişinin hatasız olduğunu doğrular.
//
// Soru: "Sunucu HTML'i ile client JavaScript çakışıyor mu?"
//       "Hydration sonrası data-testid'ler korunuyor mu?"
//
// Neden kritik: Nuxt SSR uygulamalarında hydration mismatch, kullanıcıya
// görünmez ama test edilebilir hatalara yol açar. Bu katman bu hataları
// erken yakalar.
//
// Çalıştır: npx playwright test tests/hydration/
// ---------------------------------------------------------------------------

import { test, expect } from '@playwright/test'
import { testTenants, tenantUrl } from '../config/capability-matrix'

for (const tenant of testTenants) {
  test.describe(`[Hydration] ${tenant.label} (${tenant.id})`, () => {

    // ── Console Hata Kontrolü ────────────────────────────────────────────────
    test('hydration mismatch veya Vue uyarısı yok', async ({ page }) => {
      const consoleErrors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          const text = msg.text()
          // Hydration ve Vue ile ilgili hataları yakala
          if (
            text.includes('Hydration') ||
            text.includes('hydration') ||
            text.includes('[Vue warn]') ||
            text.includes('mismatch')
          ) {
            consoleErrors.push(text)
          }
        }
      })

      await page.goto(tenantUrl(tenant, '/'))
      // Hydration için tam yüklemeyi bekle
      await page.waitForLoadState('networkidle')

      expect(
        consoleErrors,
        `Hydration hataları bulundu:\n${consoleErrors.join('\n')}`
      ).toHaveLength(0)
    })

    // ── SSR data-testid Korunması ────────────────────────────────────────────
    test('data-testid attribute\'ları hydration sonrası korunur', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle')

      // Kritik data-testid'lerin varlığını doğrula
      const criticalSelectors = [
        '[data-testid="tenant-root"]',
        '[data-testid="site-logo"]',
        '[data-testid="search-form"]',
        '[data-testid="search-input"]',
        '[data-testid="search-results"]',
      ]

      for (const selector of criticalSelectors) {
        await expect(
          page.locator(selector),
          `Selector bulunamadı: ${selector}`
        ).toBeAttached()
      }
    })

    test('tenant-root data-tenant-id attribute\'u hydration sonrası korunur', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle')

      const root = page.locator('[data-testid="tenant-root"]')
      await expect(root).toHaveAttribute('data-tenant-id', tenant.id)
    })

    // ── JavaScript Devre Dışı (SSR-only) ────────────────────────────────────
    test('JavaScript kapalıyken sayfa anlamlı içerik sunar', async ({ browser }) => {
      // JS devre dışı context oluştur — sadece SSR HTML değerlendirilir
      const context = await browser.newContext({ javaScriptEnabled: false })
      const page = await context.newPage()

      await page.goto(tenantUrl(tenant, '/'))

      // Temel HTML yapısı sunucudan gelmiş olmalı
      await expect(page.locator('[data-testid="tenant-root"]')).toBeAttached()
      await expect(page.locator('[data-testid="site-logo"]')).toBeAttached()

      await context.close()
    })

    // ── Property Detail Hydration ────────────────────────────────────────────
    test('property detail hydration sonrası içerik görünür', async ({ page }) => {
      const consoleErrors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text()
          if (text.includes('hydration') || text.includes('[Vue warn]')) {
            consoleErrors.push(text)
          }
        }
      })

      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await page.waitForLoadState('networkidle')

      expect(consoleErrors).toHaveLength(0)

      await expect(page.locator('[data-testid="property-detail-page"]')).toBeAttached()
      await expect(page.locator('[data-testid="property-title"]')).toBeVisible()
    })

  })
}
