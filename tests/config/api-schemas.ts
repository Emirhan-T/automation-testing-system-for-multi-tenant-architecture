// ---------------------------------------------------------------------------
// API RESPONSE ŞEMALARI — Zod Runtime Doğrulama
//
// FAZ 2: Response şema çıkarma
//
// Her şema iki amaça hizmet eder:
//   1. TypeScript tip güvenliği (z.infer ile tip türetme)
//   2. Runtime doğrulama — API gerçekten bu şemayı döndürüyor mu?
//
// Contract testleri (Faz 4) bu şemaları kullanarak:
//   - Tenant fark etmeksizin API response'larının aynı yapıyı koruduğunu
//   - Beklenen alanların hiç kaybolmadığını
//   - Alan tiplerinin değişmediğini
//   doğrular.
//
// Şemalar kasıtlı olarak MINIMUM kısıtlayıcı tutulmuştur:
//   - Zorunlu alanlar ve tipler kontrol edilir
//   - Opsiyonel / future alanlar için z.passthrough() / .optional() kullanılır
//   - Bu sayede backend'e gereksiz kırılganlık eklenmez
// ---------------------------------------------------------------------------

import { z } from 'zod'

// ── Capability Enum ─────────────────────────────────────────────────────────

/** Platform genelinde tanımlı capability'ler — şema ile senkronize tutulmalı */
export const CapabilitySchema = z.enum([
  'search',
  'property_detail',
  'mortgage_calculator',
  'video',
  'map',
])

// ── Mülk (Property) ─────────────────────────────────────────────────────────

/**
 * Tekil mülk nesnesi.
 * Kaynak: server/data/properties.ts → Property interface
 *
 * Kullanıldığı endpoint'ler:
 *   - GET /api/property/:id  (doğrudan döner)
 *   - GET /api/search        (results dizisinde döner)
 */
export const PropertySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string(),
  price: z.number().positive(),
  bedrooms: z.number().int().nonnegative(),
  image: z.string(),
  description: z.string(),
})

export type Property = z.infer<typeof PropertySchema>

// ── Arama Response ──────────────────────────────────────────────────────────

/**
 * GET /api/search response şeması.
 *
 * Contract garantisi: tenant farklı olsa bile bu şema HER ZAMAN dönmeli.
 * tenant alanı debug/gözlemlenebilirlik amaçlı, yokluğu test hatasına yol açmaz
 * (bu nedenle .optional() ile tanımlanmış).
 */
export const SearchResponseSchema = z.object({
  results: z.array(PropertySchema),
  totalCount: z.number().int().nonnegative(),
  tenant: z.string().optional(), // debug alanı
})

export type SearchResponse = z.infer<typeof SearchResponseSchema>

// ── Tenant Brand ────────────────────────────────────────────────────────────

/**
 * Tenant marka bilgisi — tenant-config endpoint'inde alt nesne olarak gelir.
 */
export const TenantBrandSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  logoText: z.string(),
  tagline: z.string(),
})

// ── Tenant Config Response ──────────────────────────────────────────────────

/**
 * GET /api/tenant-config response şeması.
 *
 * Önemli: domainHints alanı backend internal, client'a göndermek gerekmeyebilir.
 * Bu nedenle .optional() ile tanımlanmış.
 */
export const TenantConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: z.enum(['theme1', 'theme2', 'theme3', 'theme4']),
  capabilities: z.array(CapabilitySchema),
  brand: TenantBrandSchema,
  domainHints: z.array(z.string()).optional(),
})

export type TenantConfig = z.infer<typeof TenantConfigSchema>

// ── Mortgage Calculator Response ────────────────────────────────────────────

/**
 * POST /api/calculate-mortgage response şeması.
 *
 * Capability kontrolü: mortgage_calculator yoksa API 403 döner —
 * bu durumda bu şema doğrulanmaz (test ayrı olarak 403 kontrol eder).
 */
export const MortgageResponseSchema = z.object({
  principal: z.number().nonnegative(),
  years: z.number().int().positive(),
  monthlyPayment: z.number().nonnegative(),
})

export type MortgageResponse = z.infer<typeof MortgageResponseSchema>

// ── HTTP Hata Response ──────────────────────────────────────────────────────

/**
 * Hata durumlarında dönen standart Nitro/H3 error şeması.
 * 403, 404 gibi durumlarda response body bu yapıdadır.
 */
export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  statusMessage: z.string().optional(),
  message: z.string().optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ── Şema Haritası ───────────────────────────────────────────────────────────

/**
 * Endpoint path'ini şemasıyla eşleştiren harita.
 * Contract testleri bu haritadan hangi şema ile doğrulama yapacaklarını öğrenir.
 */
export const endpointSchemaMap = {
  '/api/tenant-config': TenantConfigSchema,
  '/api/search': SearchResponseSchema,
  '/api/property/:id': PropertySchema,
  '/api/calculate-mortgage': MortgageResponseSchema,
} as const

// ── Yardımcı Fonksiyon ──────────────────────────────────────────────────────

/**
 * Verilen response body'yi belirtilen şema ile doğrular.
 * Başarısızsa Zod hata mesajlarını insan okunabilir formatta döndürür.
 *
 * @returns { valid: true } veya { valid: false, errors: string[] }
 */
export function validateSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { valid: true; data: z.infer<T> } | { valid: false; errors: string[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { valid: true, data: result.data }
  }
  const errors = result.error.errors.map(
    e => `[${e.path.join('.')}] ${e.message}`
  )
  return { valid: false, errors }
}
