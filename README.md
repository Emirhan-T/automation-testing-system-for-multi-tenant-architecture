# Neuron Multi-Tenant Demo — 4 Tenant Prototipi

Bu proje, Neuron platformunun (Nuxt 3 SSR + multi-tenant + capability-driven
mimari) küçük ölçekli, çalışan bir simülasyonudur. Amaç, önerilen test
stratejisinin (capability matrix, data-testid sözleşmesi, davranış-odaklı
test) gerçek bir kod tabanında geçerli olduğunu kanıtlamaktır.

## Kurulum ve Çalıştırma

```bash
npm install
npm run dev
```

Sunucu http://localhost:3000 adresinde ayağa kalkar.

## 4 Tenant'ı Görüntüleme

Gerçek Neuron'da tenant, domain'e göre belirlenir. Bu demo'da 3 yöntemle
tenant seçebilirsiniz (bkz. `server/middleware/tenant.ts`):

**1) Query parametresi (tarayıcıda en kolay yöntem):**
- http://localhost:3000/?tenant=kinetic       (theme1, tüm özellikler açık)
- http://localhost:3000/?tenant=propertycloud (theme2, search+detail+map)
- http://localhost:3000/?tenant=bydesign      (theme3, search+detail+calculator)
- http://localhost:3000/?tenant=harrisons     (theme4, sadece search+detail)

**2) HTTP header (Playwright/curl/otomasyon için):**
```bash
curl -H "x-tenant: kinetic" http://localhost:3000/api/search
```

**3) Hostname eşleştirme (prod senaryosu):**
`config/tenants.ts` içindeki `domainHints` alanı, gerçek domain'lere göre
tenant çözümlemesi için kullanılır.

## Tenant / Capability Matrisi

| Tenant | Tema | Capabilities |
|---|---|---|
| kinetic | theme1 (koyu lacivert) | search, property_detail, mortgage_calculator, video, map |
| propertycloud | theme2 (minimal liste) | search, property_detail, map |
| bydesign | theme3 (magenta/siyah, kart) | search, property_detail, mortgage_calculator |
| harrisons | theme4 (geleneksel yeşil/altın) | search, property_detail |

## Mimari Notlar

- `server/middleware/tenant.ts` — SSR sırasında her istekte tenant'ı çözer,
  gerçek Neuron'daki "per-request tenant resolution" prensibinin birebir
  uygulaması.
- `config/tenants.ts` — Capability Matrix / Tenant Registry.
- `layouts/default.vue` — tenant'a göre dinamik theme class'ı uygular.
- `components/*.vue` — tüm temalarda AYNI `data-testid` ile çalışır,
  görünüm (CSS) temaya göre değişir ama davranış sözleşmesi sabittir.
- `server/api/calculate-mortgage.post.ts` — capability kontrolü sadece
  UI'da değil, API seviyesinde de yapılır (çift savunma katmanı).

## data-testid Sözleşmesi

Tüm tenant'larda ve temalarda ortak olan `data-testid` listesi:

| data-testid | Element | Açıklama |
|---|---|---|
| `tenant-root` | `<div>` | Layout root — tema class ve `data-tenant-id` taşır |
| `site-logo` | `<a>` | Logo / ana sayfa linki |
| `search-form` | `<form>` | Şehir arama formu |
| `search-input` | `<input>` | Şehir arama text alanı |
| `search-submit` | `<button>` | Arama butonu |
| `search-results` | `<section>` | Mülk listesi container'ı |
| `search-results-item` | `<a>` | Tek mülk kartı |
| `property-card-title` | `<h3>` | Karttaki mülk başlığı |
| `property-card-price` | `<p>` | Karttaki mülk fiyatı |
| `empty-state` | `<p>` | Sonuç bulunamadı mesajı |
| `price-filter` | `<div>` | Fiyat filtresi container |
| `filter-price-max` | `<input>` | Maks fiyat input |
| `filter-apply` | `<button>` | Filtrele butonu |
| `property-detail-page` | `<div>` | Detail sayfası container |
| `property-title` | `<h1>` | Mülk başlığı |
| `property-price` | `<p>` | Mülk fiyatı |
| `not-found` | `<p>` | 404 / bulunamadı mesajı |
| `mortgage-calculator` | `<section>` | İpotek hesaplayıcı *(capability-gated)* |
| `calc-deposit` | `<input>` | Peşinat input |
| `calc-submit` | `<button>` | Hesapla butonu |
| `calc-result` | `<p>` | Hesaplama sonucu |
| `video-tour` | `<section>` | Video tur bölümü *(capability-gated)* |
| `video-player` | `<div>` | Video player alanı |
| `map-section` | `<section>` | Harita bölümü *(capability-gated)* |
| `map-toggle` | `<button>` | Haritayı göster/gizle butonu |
| `map-container` | `<div>` | Harita içerik alanı |

## Test Suite — 8 Faz

### Faz 1 — Capability Matrix Doğrulama (Sunucusuz)

```bash
npx tsx tests/config/verify-phase1.ts
```

Tenant registry, route haritası ve capability × route matrisini konsola basar.

### Faz 2 — API Şema Doğrulama (Sunucu gerekli)

```bash
# Önce sunucuyu başlat:
npm run dev

# Ayrı terminalde:
npx tsx tests/config/verify-phase2.ts
```

Her tenant × her endpoint kombinasyonu için HTTP çağrısı yapar ve Zod şemasıyla doğrular.

### Faz 3 — Smoke Tests

```bash
npx playwright test tests/smoke/
```

Her tenant'ta core sayfaların yüklendiğini, tema class'ının doğru uygulandığını
ve temel UI elementlerinin görünür olduğunu doğrular.
**Kapsam:** 4 tenant × 8 test = ~32 assertion

### Faz 4 — Behaviour Tests

```bash
npx playwright test tests/behaviour/
```

Kullanıcı davranışlarını simüle eder: arama, filtreleme, navigasyon, detail içerik.
**Kapsam:** 4 tenant × 7 test = ~28 assertion

### Faz 5 — Hydration Tests

```bash
npx playwright test tests/hydration/
```

SSR → Client hydration geçişinin hatasız olduğunu, console'da mismatch
uyarısı bulunmadığını ve data-testid'lerin korunduğunu doğrular.
**Kapsam:** 4 tenant × 5 test = ~20 assertion

### Faz 6 — Visual / Geometric Tests

```bash
# İlk çalıştırmada baseline snapshot oluştur:
npx playwright test tests/visual/ --update-snapshots

# Sonraki çalıştırmalarda karşılaştır:
npx playwright test tests/visual/
```

Pixel-level screenshot karşılaştırması + geometrik kontroller (boyutlar, CSS token'ları).
**Kapsam:** 4 tenant × 6 test = ~24 assertion

### Faz 7 — Capability Tests

```bash
npx playwright test tests/capability/
```

Her capability (mortgage, map, video) için hem varlık (PRESENCE) hem yokluk
(ABSENCE) testleri. Capability matrix güncellenince testler otomatik uyum sağlar.
**Kapsam:** ~30 assertion (matrise göre dinamik)

### Faz 8 — Contract Tests

```bash
npx playwright test tests/contract/
```

Tüm API endpoint'lerinin Zod şemasına uyduğunu, capability-gating'in API
seviyesinde 403 döndürdüğünü ve cross-tenant şema tutarlılığını doğrular.
**Kapsam:** 4 tenant × ~8 API çağrısı = ~32 assertion

### Tüm Playwright Fazlarını Birden Çalıştır

```bash
npx playwright test
```

### HTML Raporu Görüntüle

```bash
npx playwright show-report
```

## Manuel Doğrulama Örnekleri

```bash
# Farklı tenant'larda theme class'ının değiştiğini doğrula
curl -s -H "x-tenant: kinetic" http://localhost:3000/ | grep -o 'class="theme[0-9]"'

# Capability-gating'in API seviyesinde çalıştığını doğrula (403 beklenir)
curl -X POST -H "x-tenant: harrisons" -H "Content-Type: application/json" \
  -d '{"price":1000000,"deposit":200000}' \
  http://localhost:3000/api/calculate-mortgage

# API contract'ın tenant fark etmeksizin aynı şemayı döndüğünü doğrula
curl -s -H "x-tenant: bydesign" http://localhost:3000/api/search
```
