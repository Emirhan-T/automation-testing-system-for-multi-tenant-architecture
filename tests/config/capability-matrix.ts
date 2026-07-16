// ---------------------------------------------------------------------------
// CAPABILITY MATRIX — Neuron Multi-Tenant Test Konfigürasyonu
//
// FAZ 1: Tenant Registry ve Capability tanımları
//
// GERÇEK NEURON'DA: Bu veri CMS / tenant config servisinden otomatik türetilir.
// Bu DEMO'DA: config/tenants.ts ile birebir hizalanmış statik tanım.
//
// Kritik tasarım kararı:
//   Test motoru bu dosyaya bakarak "hangi tenant'ta hangi testi çalıştıracağını"
//   dinamik olarak belirler. 30+ tenant için 30 ayrı test seti yazılmaz;
//   tek bir test motoru bu matrise göre davranışını ayarlar.
// ---------------------------------------------------------------------------

// ---- Tip Tanımları ---------------------------------------------------------

/** Platform genelinde tanımlı özellik tipleri */
export type Capability =
  | 'search'            // Mülk arama ve listeleme
  | 'property_detail'   // Mülk detay sayfası
  | 'mortgage_calculator' // İpotek hesaplayıcı modülü
  | 'video'             // Video tur modülü
  | 'map'               // Harita görünümü modülü

/** Test motorunun her tenant için ihtiyaç duyduğu bilgiler */
export interface TenantTestConfig {
  /** Tenant'ın benzersiz kimliği (middleware/query param ile eşleşir) */
  id: string

  /** Okunabilir etiket (test raporlarında görüntülenir) */
  label: string

  /** CSS tema sınıfı — layout/stil testlerinde doğrulanır */
  theme: 'theme1' | 'theme2' | 'theme3' | 'theme4'

  /** Bu tenant'ta aktif olan özellikler */
  capabilities: Capability[]

  /**
   * Temel URL.
   * - Demo ortamı: tüm tenant'lar aynı origin, ?tenant= query ile ayrılır
   * - Production: her tenant'ın kendi domain'i (örn. kinetic-homes.com)
   */
  baseUrl: string

  /**
   * Test sırasında kullanılacak örnek mülk ID'si.
   * Property Detail testleri bu ID üzerinden çalışır.
   */
  samplePropertyId: string

  /**
   * Bu tenant'ın temsil ettiği capability kombinasyonu.
   * Representative set seçim gerekçesini belgeler.
   */
  representativeOf: string
}

// ---- Tenant Registry -------------------------------------------------------

/**
 * Demo'daki 4 tenant, her biri farklı bir capability kombinasyonunu temsil eder.
 * Gerçek Neuron'da bu liste 30+ tenant içerir; testler sadece
 * representative set üzerinde çalışır (bkz. getRepresentativeTenants()).
 */
export const testTenants: TenantTestConfig[] = [
  {
    id: 'kinetic',
    label: 'Kinetic Homes',
    theme: 'theme1',
    capabilities: ['search', 'property_detail', 'mortgage_calculator', 'video', 'map'],
    baseUrl: 'http://localhost:3000',
    samplePropertyId: 'p1',
    representativeOf: 'Tam özellik seti: search + detail + calculator + video + map',
  },
  {
    id: 'propertycloud',
    label: 'Property Cloud',
    theme: 'theme2',
    capabilities: ['search', 'property_detail', 'map'],
    baseUrl: 'http://localhost:3000',
    samplePropertyId: 'p2',
    representativeOf: 'Harita var, hesaplayıcı yok: search + detail + map',
  },
  {
    id: 'bydesign',
    label: 'ByDesign Estates',
    theme: 'theme3',
    capabilities: ['search', 'property_detail', 'mortgage_calculator'],
    baseUrl: 'http://localhost:3000',
    samplePropertyId: 'p3',
    representativeOf: 'Hesaplayıcı var, harita yok: search + detail + calculator',
  },
  {
    id: 'harrisons',
    label: 'Harrisons & Keystone',
    theme: 'theme4',
    capabilities: ['search', 'property_detail'],
    baseUrl: 'http://localhost:3000',
    samplePropertyId: 'p4',
    representativeOf: 'Minimum özellik seti: sadece search + detail',
  },
]

// ---- Yardımcı Fonksiyonlar -------------------------------------------------

/**
 * Tenant için test URL'i oluşturur.
 *
 * Demo ortamı: ?tenant= query parametresi eklenir
 * Production ortamı: baseUrl tenant'a göre zaten farklıdır, query eklenmez
 *
 * @example
 * tenantUrl(kinetic, '/property/p1') → 'http://localhost:3000/property/p1?tenant=kinetic'
 */
export function tenantUrl(tenant: TenantTestConfig, path: string = '/'): string {
  const url = new URL(path, tenant.baseUrl)
  // Demo ortamı: tenant'ı query param ile belirt
  // Production ortamı: bu satır kaldırılır (domain zaten tenant'ı belirler)
  url.searchParams.set('tenant', tenant.id)
  return url.toString()
}

/**
 * Bir tenant'ın belirli bir capability'e sahip olup olmadığını kontrol eder.
 * Test motoru bu fonksiyon ile "bu tenant'ta bu test çalışmalı mı?" sorusunu yanıtlar.
 *
 * @example
 * if (hasCapability(tenant, 'mortgage_calculator')) {
 *   test('ipotek hesaplayıcı ...', ...)
 * }
 */
export function hasCapability(tenant: TenantTestConfig, cap: Capability): boolean {
  return tenant.capabilities.includes(cap)
}

/**
 * Tüm tenant'lardan representative set döndürür.
 *
 * Demo'da 4 tenant'ın tamamı representative'dir.
 * Gerçek Neuron'da (30+ tenant), bu fonksiyon capability
 * kombinasyonuna göre filtreleme yapar.
 */
export function getRepresentativeTenants(): TenantTestConfig[] {
  // Demo: tüm tenant'lar döner
  // Production örneği: return testTenants.filter(t => t.isRepresentative)
  return testTenants
}
