// ---------------------------------------------------------------------------
// API ENDPOINT HARİTASI — Neuron Multi-Tenant Network Analizi
//
// FAZ 2: API endpoint tespiti ve belgelenmesi
//
// Bu dosya iki amaca hizmet eder:
//   1. Platform genelindeki tüm API endpoint'lerini tek noktada belgeler
//   2. Contract testlerinin (Faz 4) hangi endpoint'leri, hangi capability'de
//      ve nasıl çağıracağını tanımlar
//
// Gerçek Neuron'da bu liste network trafiği analiz edilerek (HAR dosyası /
// Playwright intercept) çıkarılır. Bu demo'da kaynak kod incelemesiyle
// doğrudan tanımlanmıştır.
// ---------------------------------------------------------------------------

import type { TenantTestConfig } from './capability-matrix'

// ---- Tip Tanımları ---------------------------------------------------------

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiEndpoint {
  /** Okunabilir etiket — test raporlarında görüntülenir */
  label: string

  /** HTTP metodu */
  method: HttpMethod

  /**
   * URL path template.
   * Dinamik segment içeriyorsa :paramName kullan (örn. /api/property/:id)
   */
  path: string

  /** Bu endpoint'in ne yaptığını açıklar */
  description: string

  /**
   * Bu endpoint'i test etmek için gerekli capability.
   * undefined → her tenant'ta test edilir
   */
  requiredCapability?: string

  /**
   * POST/PUT/PATCH istekleri için örnek request body.
   * Contract testi bu payload'u kullanır.
   */
  samplePayload?: Record<string, unknown>

  /**
   * Tenant bağımsız mı çalışmalı?
   * true  → tüm tenant'larda AYNI şema dönmeli (contract testi bunu doğrular)
   * false → tenant'a göre farklı veri dönebilir ama şema sabit kalmalı
   */
  tenantAgnosticSchema: boolean

  /**
   * Capability eksikse beklenen HTTP status kodu.
   * Tanımlıysa, capability olmayan tenant'ta bu kod test edilir.
   */
  blockedStatusCode?: number
}

// ---- Endpoint Kataloğu ----------------------------------------------------

/**
 * Demo'daki tüm API endpoint'leri.
 *
 * Kaynak: server/api/* dizini incelenerek çıkarılmıştır.
 * Gerçek Neuron'da: HAR kaydı + Playwright network intercept ile otomatik keşfedilir.
 */
export const apiEndpoints: ApiEndpoint[] = [
  // ── Tenant & Config ─────────────────────────────────────────────────────
  {
    label: 'Tenant Config',
    method: 'GET',
    path: '/api/tenant-config',
    description:
      'Aktif tenant\'ın kimliği, teması ve capability listesini döner. ' +
      'Her tenant farklı veri döner ama şema sabit kalmalıdır.',
    tenantAgnosticSchema: true,
  },

  // ── Arama & Listeleme ───────────────────────────────────────────────────
  {
    label: 'Property Search',
    method: 'GET',
    path: '/api/search',
    description:
      '?city= query parametresi ile mülk filtreler. ' +
      'Tenant bağımsız: tüm tenant\'larda { results, totalCount, tenant } şeması dönmelidir.',
    tenantAgnosticSchema: true,
  },

  // ── Mülk Detay ──────────────────────────────────────────────────────────
  {
    label: 'Property Detail',
    method: 'GET',
    path: '/api/property/:id',
    description:
      'ID ile tekil mülk döner. ' +
      'Bulunamazsa 404. Şema tüm tenant\'larda sabittir.',
    tenantAgnosticSchema: true,
  },

  // ── Modüller (Capability-Gated) ─────────────────────────────────────────
  {
    label: 'Mortgage Calculator',
    method: 'POST',
    path: '/api/calculate-mortgage',
    description:
      'İpotek aylık taksit hesaplar. ' +
      'mortgage_calculator capability\'si olmayan tenant\'larda 403 döner — ' +
      'bu çift savunma katmanının (UI + API) API ayağıdır.',
    requiredCapability: 'mortgage_calculator',
    samplePayload: {
      price: 1_000_000,
      deposit: 200_000,
      years: 25,
    },
    tenantAgnosticSchema: true,
    blockedStatusCode: 403,
  },
]

// ---- Yardımcı Fonksiyonlar -------------------------------------------------

/**
 * Endpoint path'indeki :param template'lerini gerçek değerlerle doldurur.
 *
 * @example
 * resolveEndpointPath('/api/property/:id', { id: 'p1' }) → '/api/property/p1'
 */
export function resolveEndpointPath(
  path: string,
  params: Record<string, string> = {}
): string {
  return Object.entries(params).reduce(
    (p, [key, val]) => p.replace(`:${key}`, val),
    path
  )
}

/**
 * Bir tenant için endpoint'in tam test URL'ini oluşturur.
 * Demo: ?tenant= query param eklenir.
 * Production: tenant baseUrl'i zaten farklı, query param gerekmez.
 */
export function endpointTestUrl(
  tenant: TenantTestConfig,
  endpoint: ApiEndpoint,
  pathParams: Record<string, string> = {}
): string {
  const resolvedPath = resolveEndpointPath(endpoint.path, pathParams)
  const url = new URL(resolvedPath, tenant.baseUrl)
  url.searchParams.set('tenant', tenant.id)
  return url.toString()
}

/**
 * Tüm tenant'larda test edilecek endpoint'leri döndürür (capability filtresi yok).
 * Contract testleri hem "erişilebilir" hem "erişim engeli" durumlarını test eder.
 */
export function getAllEndpoints(): ApiEndpoint[] {
  return apiEndpoints
}

/**
 * Belirli bir capability'e sahip tenant'larda çalışan endpoint'leri döndürür.
 */
export function getEndpointsForCapability(capability: string): ApiEndpoint[] {
  return apiEndpoints.filter(e => e.requiredCapability === capability)
}
