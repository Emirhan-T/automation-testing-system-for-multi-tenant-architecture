import type { Page } from '@playwright/test'

export type AuditSeverity = 'warning' | 'error'

export interface AuditViolation {
  rule: string
  severity: AuditSeverity
  component: string
  message: string
  expected: string
  actual: string
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface AuditReport {
  url: string
  viewport: { width: number; height: number }
  checkedComponents: number
  violations: AuditViolation[]
}

interface AuditOptions {
  tolerance?: number
  defaultMinimumTarget?: number
}

export async function auditPageGeometry(
  page: Page,
  options: AuditOptions = {}
): Promise<AuditReport> {
  const tolerance = options.tolerance ?? 1
  const defaultMinimumTarget = options.defaultMinimumTarget ?? 44

  return page.evaluate(
    ({ tolerance, defaultMinimumTarget }) => {
      type BrowserViolation = AuditViolation

      const violations: BrowserViolation[] = []
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      const isVisible = (element: HTMLElement) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) !== 0 &&
          rect.width > 0 &&
          rect.height > 0
        )
      }

      const identify = (element: HTMLElement) =>
        element.dataset.testid ||
        element.getAttribute('aria-label') ||
        element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60) ||
        element.tagName.toLowerCase()

      const boundsOf = (rect: DOMRect) => ({
        x: Math.round(rect.x * 100) / 100,
        y: Math.round(rect.y * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100
      })

      if (document.documentElement.scrollWidth > viewport.width + tolerance) {
        violations.push({
          rule: 'viewport-overflow',
          severity: 'error',
          component: 'page',
          message: 'Sayfa yatay olarak ekranın dışına taşıyor.',
          expected: `≤ ${viewport.width + tolerance}px`,
          actual: `${document.documentElement.scrollWidth}px`
        })
      }

      const audited = Array.from(
        document.querySelectorAll<HTMLElement>('[data-ui-audit]')
      ).filter(isVisible)

      for (const element of audited) {
        const rect = element.getBoundingClientRect()
        const component = identify(element)

        if (
          rect.left < -tolerance ||
          rect.right > viewport.width + tolerance
        ) {
          violations.push({
            rule: 'component-viewport-containment',
            severity: 'error',
            component,
            message: 'Bileşenin bir bölümü ekranın yatay sınırları dışında.',
            expected: `0–${viewport.width}px içinde`,
            actual: `${Math.round(rect.left)}–${Math.round(rect.right)}px`,
            bounds: boundsOf(rect)
          })
        }

        if (element.dataset.uiAudit === 'interactive') {
          const minimum = Number(
            element.dataset.uiMinSize || defaultMinimumTarget
          )

          if (rect.width + tolerance < minimum || rect.height + tolerance < minimum) {
            violations.push({
              rule: 'minimum-touch-target',
              severity: 'error',
              component,
              message: 'Etkileşim alanı rahat kullanım için çok küçük.',
              expected: `en az ${minimum}×${minimum}px`,
              actual: `${Math.round(rect.width)}×${Math.round(rect.height)}px`,
              bounds: boundsOf(rect)
            })
          }
        }

        const shouldCheckText =
          element.dataset.uiAudit === 'text' ||
          element.matches('button, a')

        const horizontalContentOverflow =
          element.scrollWidth > element.clientWidth + tolerance

        const verticalContentOverflow =
          element.dataset.uiCheckVertical === 'true' &&
          element.scrollHeight > element.clientHeight + tolerance

        if (
          shouldCheckText &&
          element.dataset.uiAllowOverflow !== 'true' &&
          (horizontalContentOverflow || verticalContentOverflow)
        ) {
          violations.push({
            rule: 'content-overflow',
            severity: 'error',
            component,
            message: 'Yazı veya içerik kendisine ayrılan alana sığmıyor.',
            expected: `${element.clientWidth}×${element.clientHeight}px içine sığmalı`,
            actual: `${element.scrollWidth}×${element.scrollHeight}px gerekiyor`,
            bounds: boundsOf(rect)
          })
        }
      }

      const groups = Array.from(
        document.querySelectorAll<HTMLElement>('[data-ui-overlap-group]')
      )

      for (const group of groups) {
        const children = Array.from(
          group.querySelectorAll<HTMLElement>(':scope > [data-ui-audit]')
        ).filter(isVisible)

        for (let first = 0; first < children.length; first++) {
          for (let second = first + 1; second < children.length; second++) {
            const a = children[first].getBoundingClientRect()
            const b = children[second].getBoundingClientRect()
            const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left)
            const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
            const overlapArea =
              Math.max(0, overlapWidth) * Math.max(0, overlapHeight)

            if (overlapArea > tolerance * tolerance) {
              violations.push({
                rule: 'component-overlap',
                severity: 'error',
                component: `${identify(children[first])} ↔ ${identify(children[second])}`,
                message: 'Bağımsız bileşenlerin alanları birbiriyle çakışıyor.',
                expected: '0px² kesişim',
                actual: `${Math.round(overlapArea)}px² kesişim`
              })
            }
          }
        }
      }

      return {
        url: window.location.href,
        viewport,
        checkedComponents: audited.length,
        violations
      }
    },
    { tolerance, defaultMinimumTarget }
  )
}

export function formatAuditViolations(report: AuditReport): string {
  if (report.violations.length === 0) {
    return 'UI geometrisi kurallara uygun.'
  }

  return report.violations
    .map(
      violation =>
        `[${violation.severity.toUpperCase()}] ${violation.component}\n` +
        `  ${violation.message}\n` +
        `  Beklenen: ${violation.expected}\n` +
        `  Gerçek: ${violation.actual}`
    )
    .join('\n\n')
}
