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

## Test Katmanlarını Doğrulama (manuel örnekler)

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

Bir sonraki adım: bu proje üzerine gerçek bir Playwright test suite'i
(Smoke, Behaviour, Hydration, Görsel/Geometrik, Capability, Contract
katmanları) yazılarak önerilen strateji uçtan uca kanıtlanır.
