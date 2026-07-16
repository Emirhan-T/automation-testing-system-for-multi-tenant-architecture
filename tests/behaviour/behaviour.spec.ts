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
      const items = page.locator('[data-testid="search-results-item"]')
      const count = await items.count()
      expect(count).toBeGreaterThanOrEqual(4) // 4 örnek mülk var
    })

    test('şehir araması sonuçları filtreler', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))

      // "İstanbul" ara
      await page.fill('[data-testid="search-input"]', 'İstanbul')
      await page.click('[data-testid="search-submit"]')

      // Sonuçların gelmesi için bekle
      await page.waitForTimeout(500)

      const items = page.locator('[data-testid="search-results-item"]')
      const count = await items.count()

      // İstanbul'da 2 mülk var (p1, p2)
      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThan(4) // Tümü değil, filtrelenmiş
    })

    test('geçersiz şehir araması boş durum gösterir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.fill('[data-testid="search-input"]', 'XxGeçersizŞehirxX')
      await page.click('[data-testid="search-submit"]')
      await page.waitForTimeout(500)

      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    })

    // ── Fiyat Filtresi ───────────────────────────────────────────────────────
    test('fiyat filtresi pahalı mülkleri gizler', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))

      // Toplam mülk sayısını al
      const beforeCount = await page.locator('[data-testid="search-results-item"]').count()

      // Düşük bir fiyat limiti uygula (3.5M TL — sadece p3 geçer)
      await page.fill('[data-testid="filter-price-max"]', '3500000')
      await page.click('[data-testid="filter-apply"]')
      await page.waitForTimeout(300)

      const afterCount = await page.locator('[data-testid="search-results-item"]').count()
      expect(afterCount).toBeLessThan(beforeCount)
    })

    // ── Navigasyon ───────────────────────────────────────────────────────────
    test('mülk kartına tıklamak detail sayfasına yönlendirir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))

      // İlk karta tıkla
      await page.locator('[data-testid="search-results-item"]').first().click()

      // Detail sayfasında olduğumuzu doğrula
      await expect(page.locator('[data-testid="property-detail-page"]')).toBeVisible()
      await expect(page).toHaveURL(/\/property\//)
    })

    test('logo\'ya tıklamak ana sayfaya döndürür', async ({ page }) => {
      // Detail sayfasından başla
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))

      await page.click('[data-testid="site-logo"]')

      // Ana sayfaya döndük
      await expect(page.locator('[data-testid="search-form"]')).toBeVisible()
    })

    // ── Property Detail İçerik ───────────────────────────────────────────────
    test('property detail doğru mülk bilgilerini gösterir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))

      // Başlık boş değil
      const title = page.locator('[data-testid="property-title"]')
      await expect(title).toBeVisible()
      const titleText = await title.textContent()
      expect(titleText?.trim().length).toBeGreaterThan(0)

      // Fiyat ₺ simgesi içeriyor
      const price = page.locator('[data-testid="property-price"]')
      await expect(price).toBeVisible()
      await expect(price).toContainText('₺')
    })

    test('geçersiz property ID 404 durumunu gösterir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/property/GECERSIZ_ID'))
      await expect(page.locator('[data-testid="not-found"]')).toBeVisible()
    })

  })
}
