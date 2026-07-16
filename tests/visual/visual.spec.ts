// ---------------------------------------------------------------------------
// FAZ 6 — VISUAL / GEOMETRIC TESTS
//
// Amaç: Her tenant'ın görsel kimliğinin doğru uygulandığını ve layout'un
//       geometrik olarak tutarlı olduğunu doğrular.
//
// Soru: "Her tenant doğru renge/stile sahip mi?"
//       "Önemli elementler görünür boyutlarda mı?"
//
// İLK ÇALIŞTIRMA: Baseline snapshot'ları oluştur:
//   npx playwright test tests/visual/ --update-snapshots
//
// SONRAKI ÇALIŞTIRMALARDA:
//   npx playwright test tests/visual/
//
// Çalıştır: npx playwright test tests/visual/
// ---------------------------------------------------------------------------

import { test, expect } from '@playwright/test'
import { testTenants, tenantUrl } from '../config/capability-matrix'

for (const tenant of testTenants) {
  test.describe(`[Visual] ${tenant.label} (${tenant.id})`, () => {

    // ── Snapshot Testleri ────────────────────────────────────────────────────
    test('ana sayfa görünümü baseline ile eşleşir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle')

      // Animasyonları durdur — tutarlı snapshot için
      await page.addStyleTag({
        content: `*, *::before, *::after { 
          animation-duration: 0s !important; 
          transition-duration: 0s !important; 
        }`
      })

      await expect(page).toHaveScreenshot(`${tenant.id}-home.png`, {
        fullPage: false,
        maxDiffPixelRatio: 0.02, // %2 tolerans
      })
    })

    test('property detail görünümü baseline ile eşleşir', async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await page.waitForLoadState('networkidle')

      await page.addStyleTag({
        content: `*, *::before, *::after { 
          animation-duration: 0s !important; 
          transition-duration: 0s !important; 
        }`
      })

      await expect(page).toHaveScreenshot(`${tenant.id}-detail.png`, {
        fullPage: false,
        maxDiffPixelRatio: 0.02,
      })
    })

    // ── Geometrik Testler ────────────────────────────────────────────────────
    test('header minimum yükseklik koşulunu karşılıyor', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const header = page.locator('.site-header')
      await expect(header).toBeVisible()

      const box = await header.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThanOrEqual(60) // min 60px yükseklik
    })

    test('property card boyutları makul aralıkta', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const card = page.locator('[data-testid="search-results-item"]').first()
      await expect(card).toBeVisible()

      const box = await card.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThan(200)  // çok dar değil
      expect(box!.height).toBeGreaterThan(100) // çok kısa değil
    })

    test('search input tıklanabilir boyutta', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const input = page.locator('[data-testid="search-input"]')
      await expect(input).toBeVisible()

      const box = await input.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThanOrEqual(32) // min touch target
      expect(box!.width).toBeGreaterThan(100)
    })

    test('logo görünür ve tıklanabilir alanda', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      const logo = page.locator('[data-testid="site-logo"]')
      await expect(logo).toBeVisible()
      await expect(logo).toBeInViewport()
    })

    // ── Tema Renk Token Kontrolü ─────────────────────────────────────────────
    test('tenant-root CSS değişkenleri tanımlı', async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))

      const primaryColor = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="tenant-root"]') as HTMLElement
        return window.getComputedStyle(el).getPropertyValue('--color-primary').trim()
      })

      // CSS değişkeninin tanımlı olduğunu doğrula (boş değil)
      expect(primaryColor.length).toBeGreaterThan(0)
    })

  })
}
