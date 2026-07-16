// ---------------------------------------------------------------------------
// FAZ 4 — BEHAVIOUR TESTS
//
// Amaç: Kullanıcı davranışlarını simüle ederek iş akışlarının doğru
//       çalıştığını doğrular.
//
// Soru: "Kullanıcı ne yapabilir? Akışlar doğru mu?"
//
// Çalıştır: npx playwright test tests/behaviour/
// ---------------------------------------------------------------------------

import { test, expect } from '@playwright/test'
import { testTenants, tenantUrl } from '../config/capability-matrix'

for (const tenant of testTenants) {
  test.describe(`[Behaviour] ${tenant.label} (${tenant.id})`, () => {

    // ── Arama Davranışı ──────────────────────────────────────────────────────
    test('boş aramada tüm mülkler listelenir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle') // Vue hydration tamamlanana kadar bekle
      const items = page.locator('[data-testid="search-results-item"]')
      const count = await items.count()
      expect(count).toBeGreaterThanOrEqual(4)
    })

    test('şehir araması sonuçları filtreler', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      // networkidle: Vue hydration ve event handler'ların bağlanmasını bekle
      await page.waitForLoadState('networkidle')

      // 'Ankara' kullan — saf ASCII, Turkish-İ locale sorunu yok; 1 sonuç döner
      const [_response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/api/search') && r.status() === 200),
        (async () => {
          await page.fill('[data-testid="search-input"]', 'Ankara')
          await page.click('[data-testid="search-submit"]')
        })()
      ])

      // Vue reaktif güncelleme için DOM'u bekle (count < 4 olmalı)
      await page.waitForFunction(
        () => document.querySelectorAll('[data-testid="search-results-item"]').length < 4,
        { timeout: 8000 }
      )

      const count = await page.locator('[data-testid="search-results-item"]').count()
      expect(count).toBeGreaterThan(0) // Ankara'da 1 mülk var
      expect(count).toBeLessThan(4)    // Tümü değil, filtrelenmiş
    })

    test('geçersiz şehir araması boş durum gösterir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle')

      await Promise.all([
        page.waitForResponse(r => r.url().includes('/api/search') && r.status() === 200),
        (async () => {
          await page.fill('[data-testid="search-input"]', 'XxGecersizSehirxX')
          await page.click('[data-testid="search-submit"]')
        })()
      ])

      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible({ timeout: 8000 })
    })

    // ── Fiyat Filtresi ───────────────────────────────────────────────────────
    test('fiyat filtresi pahalı mülkleri gizler', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle')

      const beforeCount = await page.locator('[data-testid="search-results-item"]').count()
      expect(beforeCount).toBeGreaterThan(1)

      // Düşük fiyat limiti (3.5M TL — sadece p3:3.2M geçer)
      await page.fill('[data-testid="filter-price-max"]', '3500000')
      await page.click('[data-testid="filter-apply"]')

      // Fiyat filtresi client-side (reaktif) — DOM güncellemesini bekle
      await page.waitForFunction(
        (before: number) =>
          document.querySelectorAll('[data-testid="search-results-item"]').length < before,
        beforeCount,
        { timeout: 8000 }
      )

      const afterCount = await page.locator('[data-testid="search-results-item"]').count()
      expect(afterCount).toBeLessThan(beforeCount)
    })

    // ── Navigasyon ───────────────────────────────────────────────────────────
    test('mülk kartına tıklamak detail sayfasına yönlendirir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle')
      await page.locator('[data-testid="search-results-item"]').first().click()
      await expect(page.locator('[data-testid="property-detail-page"]')).toBeVisible()
      await expect(page).toHaveURL(/\/property\//)
    })

    test('logo\'ya tıklamak ana sayfaya döndürür', async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await page.waitForLoadState('networkidle')
      await page.click('[data-testid="site-logo"]')
      await expect(page.locator('[data-testid="search-form"]')).toBeVisible()
    })

    // ── Property Detail İçerik ───────────────────────────────────────────────
    test('property detail doğru mülk bilgilerini gösterir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await page.waitForLoadState('networkidle')

      const title = page.locator('[data-testid="property-title"]')
      await expect(title).toBeVisible()
      const titleText = await title.textContent()
      expect(titleText?.trim().length).toBeGreaterThan(0)

      const price = page.locator('[data-testid="property-price"]')
      await expect(price).toBeVisible()
      await expect(price).toContainText('₺')
    })

    test('geçersiz property ID 404 durumunu gösterir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/property/GECERSIZ_ID'))
      await page.waitForLoadState('networkidle')
      await expect(page.locator('[data-testid="not-found"]')).toBeVisible()
    })

  })
}
