import { test, expect } from '@playwright/test'
import { testTenants, tenantUrl } from '../config/capability-matrix'
import { auditPageGeometry, formatAuditViolations } from './audit-engine'

const viewports = [
  { name: 'mobile-small', width: 320, height: 568 },
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 }
]

for (const tenant of testTenants) {
  for (const viewport of viewports) {
    test.describe(`[UI Audit] ${tenant.id} · ${viewport.name}`, () => {
      test.use({
        viewport: {
          width: viewport.width,
          height: viewport.height
        }
      })

      const pages = [
        { name: 'home', path: '/' },
        {
          name: 'property-detail',
          path: `/property/${tenant.samplePropertyId}`
        },
        { name: 'quality-center', path: '/ui-quality' }
      ]

      for (const scenario of pages) {
        test(`${scenario.name} geometrisi kurallara uygun`, async ({ page }) => {
          await page.goto(tenantUrl(tenant, scenario.path))
          await page.waitForLoadState('networkidle')
          await page.evaluate(() => document.fonts.ready)

          const report = await auditPageGeometry(page)
          const errors = report.violations.filter(
            violation => violation.severity === 'error'
          )

          expect(
            errors,
            `${tenant.id} · ${viewport.width}×${viewport.height} · ${scenario.path}\n\n` +
              formatAuditViolations(report)
          ).toEqual([])
        })
      }
    })
  }
}
