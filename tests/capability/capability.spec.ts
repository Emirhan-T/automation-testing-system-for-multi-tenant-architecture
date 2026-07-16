// ---------------------------------------------------------------------------
// FAZ 7 — CAPABILITY TESTS
//
// Amaç: Her tenant'ta doğru UI component'larının gösterilip/gizlendiğini
//       doğrular. Bu, capability-driven mimarinin UI katmanındaki kanıtıdır.
//
// Soru: "Capability'si olan tenant bileşeni görüyor mu?"
//       "Capability'si olmayan tenant bileşeni görüyor mu? (Hayır!)"
//
// Tasarım kararı: Test motoru capability matrix'ten dinamik davranır.
// 30+ tenant için 30 ayrı test seti YAZILMAYABİLİR; bu dosya aynı
// mantığı çalıştırır ve matris güncellenince testler otomatik uyum sağlar.
//
// Çalıştır: npx playwright test tests/capability/
// ---------------------------------------------------------------------------

import { test, expect } from '@playwright/test'
import {
  testTenants,
  tenantUrl,
  hasCapability,
  type TenantTestConfig,
} from '../config/capability-matrix'

// ── Yardımcı: Belirli capability'li/capability'siz tenant'ları döndür ────────

function tenantsWithCap(cap: Parameters<typeof hasCapability>[1]) {
  return testTenants.filter(t => hasCapability(t, cap))
}

function tenantsWithoutCap(cap: Parameters<typeof hasCapability>[1]) {
  return testTenants.filter(t => !hasCapability(t, cap))
}

// ============================================================================
// MORTGAGE CALCULATOR — kinetic, bydesign'da VAR; propertycloud, harrisons'da YOK
// ============================================================================

test.describe('[Capability] mortgage_calculator — PRESENCE', () => {
  for (const tenant of tenantsWithCap('mortgage_calculator')) {
    test(`[${tenant.id}] ipotek hesaplayıcı görünür`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await expect(
        page.locator('[data-testid="mortgage-calculator"]')
      ).toBeVisible()
    })

    test(`[${tenant.id}] hesapla butonuna tıklamak sonuç gösterir`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await page.waitForLoadState('networkidle') // Vue event handler'ları bağlanana kadar bekle
      await page.click('[data-testid="calc-submit"]')
      await expect(page.locator('[data-testid="calc-result"]')).toBeVisible({ timeout: 8000 })
      await expect(page.locator('[data-testid="calc-result"]')).toContainText('₺')
    })
  }
})

test.describe('[Capability] mortgage_calculator — ABSENCE', () => {
  for (const tenant of tenantsWithoutCap('mortgage_calculator')) {
    test(`[${tenant.id}] ipotek hesaplayıcı DOM'da yok`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await expect(
        page.locator('[data-testid="mortgage-calculator"]')
      ).not.toBeAttached()
    })
  }
})

// ============================================================================
// MAP — kinetic, propertycloud'da VAR; bydesign, harrisons'da YOK
// ============================================================================

test.describe('[Capability] map — PRESENCE', () => {
  for (const tenant of tenantsWithCap('map')) {
    test(`[${tenant.id}] harita bölümü ana sayfada görünür`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle')
      await expect(page.locator('[data-testid="map-section"]')).toBeVisible()
    })

    test(`[${tenant.id}] harita toggle butonuna tıklamak haritayı açar`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await page.waitForLoadState('networkidle') // Vue @click handler'ı bağlanana kadar bekle
      await page.click('[data-testid="map-toggle"]')
      await expect(page.locator('[data-testid="map-container"]')).toBeVisible({ timeout: 8000 })
    })
  }
})

test.describe('[Capability] map — ABSENCE', () => {
  for (const tenant of tenantsWithoutCap('map')) {
    test(`[${tenant.id}] harita bölümü DOM'da yok`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, '/'))
      await expect(
        page.locator('[data-testid="map-section"]')
      ).not.toBeAttached()
    })
  }
})

// ============================================================================
// VIDEO — sadece kinetic'te VAR; diğer 3 tenant'ta YOK
// ============================================================================

test.describe('[Capability] video — PRESENCE', () => {
  for (const tenant of tenantsWithCap('video')) {
    test(`[${tenant.id}] video turu bölümü görünür`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await expect(page.locator('[data-testid="video-tour"]')).toBeVisible()
    })

    test(`[${tenant.id}] video player alanı render edilmiş`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await expect(page.locator('[data-testid="video-player"]')).toBeVisible()
    })
  }
})

test.describe('[Capability] video — ABSENCE', () => {
  for (const tenant of tenantsWithoutCap('video')) {
    test(`[${tenant.id}] video turu DOM'da yok`, async ({ page }) => {
      await page.goto(tenantUrl(tenant, `/property/${tenant.samplePropertyId}`))
      await expect(
        page.locator('[data-testid="video-tour"]')
      ).not.toBeAttached()
    })
  }
})

// ============================================================================
// CROSS-TENANT: Aynı anda hem olan hem olmayan tenant'ların karşılaştırması
// ============================================================================

test.describe('[Capability] Cross-tenant karşılaştırma', () => {
  test('kinetic tüm bileşenlere sahip, harrisons hiçbirine değil', async ({ browser }) => {
    const kinetic = testTenants.find(t => t.id === 'kinetic')!
    const harrisons = testTenants.find(t => t.id === 'harrisons')!

    // Aynı anda iki sayfa aç
    const kPage = await (await browser.newContext()).newPage()
    const hPage = await (await browser.newContext()).newPage()

    await kPage.goto(tenantUrl(kinetic, `/property/${kinetic.samplePropertyId}`))
    await hPage.goto(tenantUrl(harrisons, `/property/${harrisons.samplePropertyId}`))

    // Kinetic: mortgage + video var
    await expect(kPage.locator('[data-testid="mortgage-calculator"]')).toBeVisible()
    await expect(kPage.locator('[data-testid="video-tour"]')).toBeVisible()

    // Harrisons: mortgage + video yok
    await expect(hPage.locator('[data-testid="mortgage-calculator"]')).not.toBeAttached()
    await expect(hPage.locator('[data-testid="video-tour"]')).not.toBeAttached()

    await kPage.context().close()
    await hPage.context().close()
  })
})
