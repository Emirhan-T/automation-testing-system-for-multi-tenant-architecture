// ---------------------------------------------------------------------------
// ROUTE MAP — Neuron Multi-Tenant Route Analizi
//
// FAZ 1: Her tenant için mevcut route'ların belgelenmesi
//
// Bu dosya iki amaca hizmet eder:
//   1. Smoke testlerinin hangi route'ları ziyaret edeceğini tanımlar
//   2. Platform genelindeki route yapısını tek noktada belgeler
//
// NOT: Demo'da tüm tenant'lar aynı route setine sahiptir.
//      Gerçek Neuron'da bazı tenant'lar ek route'lara sahip olabilir
//      (örn. 'commercial' capability'si olan bir tenant /commercial/* route'larına sahip olabilir).
// ---------------------------------------------------------------------------

import type { TenantTestConfig } from './capability-matrix'
import { hasCapability, tenantUrl } from './capability-matrix'

// ---- Tip Tanımları ---------------------------------------------------------

/** Tek bir route'un test bağlamındaki tam tanımı */
export interface RouteDefinition {
  /** URL path (örn. '/', '/property/p1') */
  path: string

  /** Tam URL (tenant query param dahil) */
  url: string

  /** Bu route'u test etmek için gerekli capability (yoksa undefined = her tenant'ta var) */
  requiredCapability?: string

  /** Okunabilir etiket — test raporunda görüntülenir */
  label: string
}

/** Bir tenant'ın tüm test edilebilir route'larının haritası */
export interface TenantRouteMap {
  /** Tüm route'lar (hem zorunlu hem opsiyonel) */
  all: RouteDefinition[]

  /** Her tenant'ta mutlaka var olan temel route'lar */
  core: RouteDefinition[]

  /** Yalnızca belirli capability'lere sahip tenant'larda bulunan route'lar */
  capabilityGated: RouteDefinition[]
}

// ---- Route Haritası Oluşturucu --------------------------------------------

/**
 * Bir tenant için route haritasını oluşturur.
 *
 * Smoke testleri core route'ları ziyaret eder.
 * Capability testleri capabilityGated route'larını kullanır.
 */
export function getTenantRouteMap(tenant: TenantTestConfig): TenantRouteMap {
  // ── Core Routes: Her tenant'ta her zaman mevcut ──────────────────────────
  const core: RouteDefinition[] = [
    {
      path: '/',
      url: tenantUrl(tenant, '/'),
      label: 'Ana Sayfa (Arama & Listeleme)',
    },
    {
      path: `/property/${tenant.samplePropertyId}`,
      url: tenantUrl(tenant, `/property/${tenant.samplePropertyId}`),
      requiredCapability: 'property_detail',
      label: 'Mülk Detay Sayfası',
    },
  ]

  // ── Capability-Gated Routes: Sadece ilgili capability'de mevcut ──────────
  // NOT: Demo'da ek route yoktur; gerçek Neuron'da buraya eklenebilir:
  //
  // Örnek:
  // if (hasCapability(tenant, 'commercial')) {
  //   capabilityGated.push({
  //     path: '/commercial',
  //     url: tenantUrl(tenant, '/commercial'),
  //     requiredCapability: 'commercial',
  //     label: 'Ticari Mülkler',
  //   })
  // }
  const capabilityGated: RouteDefinition[] = []

  return {
    all: [...core, ...capabilityGated],
    core,
    capabilityGated,
  }
}

// ---- Durum Matrisi ---------------------------------------------------------

/**
 * Tüm tenant'lar için route × capability matrisini döndürür.
 * Faz 1 dokümantasyonu ve manuel inceleme için kullanılır.
 *
 * @returns Her tenant'ın hangi route'lara erişebildiğini gösteren matris
 */
export function buildRouteCapabilityMatrix(
  tenants: TenantTestConfig[]
): Array<{ tenant: string; route: string; accessible: boolean; reason: string }> {
  const matrix: Array<{ tenant: string; route: string; accessible: boolean; reason: string }> = []

  for (const tenant of tenants) {
    const routeMap = getTenantRouteMap(tenant)

    for (const route of routeMap.all) {
      const accessible = route.requiredCapability
        ? hasCapability(tenant, route.requiredCapability as any)
        : true

      matrix.push({
        tenant: tenant.id,
        route: route.path,
        accessible,
        reason: accessible
          ? 'Core route veya capability mevcut'
          : `Capability eksik: ${route.requiredCapability}`,
      })
    }
  }

  return matrix
}
