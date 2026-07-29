<script setup lang="ts">
const tenant = await useTenant()

const { data } = await useFetch('/api/search', {
  headers: tenantHeaders()
})
const results = ref(data.value?.results ?? [])
const maxPrice = ref(Infinity)
const activeCity = ref('')

async function onSearch(city: string) {
  activeCity.value = city
  const res = await $fetch('/api/search', {
    query: { city },
    headers: tenantHeaders()
  })
  results.value = res.results
}

function onFilterApply(price: number) {
  maxPrice.value = price
}

const filteredResults = computed(() =>
  results.value.filter(p => p.price <= maxPrice.value)
)

const hasMap = computed(() => tenant.value?.capabilities.includes('map'))
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero__glow hero__glow--one" />
      <div class="hero__glow hero__glow--two" />
      <div class="page-shell hero__inner">
        <div class="hero__copy">
          <p class="eyebrow">Akıllı emlak deneyimi</p>
          <h1 data-ui-audit="text">
            Her ekranda doğru görünen
            <span>evler ve arayüzler.</span>
          </h1>
          <p class="hero__lead">
            Dört farklı marka, tek güvenilir sistem. Neuron her sayfayı oluşturur;
            UI Quality Center her bileşenin yerine tam oturduğunu matematikle doğrular.
          </p>

          <div class="hero__proof">
            <span><strong>4</strong> tenant</span>
            <span><strong>5</strong> ekran sınıfı</span>
            <span><strong>170+</strong> davranış testi</span>
          </div>
        </div>

        <div class="search-panel surface-card" data-ui-audit="container">
          <div class="search-panel__header">
            <div>
              <span class="search-panel__step">01</span>
              <strong>Şehrini seç</strong>
            </div>
            <span class="live-pill"><i /> Sistem hazır</span>
          </div>
          <SearchForm @search="onSearch" />
          <p class="search-panel__hint">İstanbul, Ankara veya İzmir ile deneyebilirsin.</p>
        </div>
      </div>
    </section>

    <section class="trust-strip">
      <div class="page-shell trust-strip__inner">
        <div>
          <span class="trust-icon">✓</span>
          <p><strong>Taşma kontrolü</strong><small>Yazılar kutuya sığıyor mu?</small></p>
        </div>
        <div>
          <span class="trust-icon">↔</span>
          <p><strong>Ekran kontrolü</strong><small>Bileşenler dışarı taşıyor mu?</small></p>
        </div>
        <div>
          <span class="trust-icon">◎</span>
          <p><strong>Dokunma kontrolü</strong><small>Butonlar rahat kullanılabiliyor mu?</small></p>
        </div>
      </div>
    </section>

    <section class="listings-section page-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Seçili portföy</p>
          <h2>{{ activeCity ? `${activeCity} sonuçları` : 'Öne çıkan yaşam alanları' }}</h2>
        </div>
        <p>
          Her kart aynı veri sözleşmesini kullanır; görünümü aktif markanın
          karakterine göre değişir.
        </p>
      </div>

      <div class="filter-row">
        <p><strong>{{ filteredResults.length }}</strong> uygun ilan gösteriliyor</p>
        <PriceFilter @apply="onFilterApply" />
      </div>

      <section class="results-grid" data-testid="search-results" data-ui-audit="grid">
        <PropertyCard
          v-for="p in filteredResults"
          :key="p.id"
          :property="p"
        />
      </section>

      <div v-if="hasMap" class="map-wrap">
        <MapView />
      </div>

      <div v-if="filteredResults.length === 0" class="empty-card surface-card">
        <span>⌕</span>
        <p data-testid="empty-state">Sonuç bulunamadı.</p>
        <small>Farklı bir şehir veya fiyat aralığı deneyebilirsin.</small>
      </div>
    </section>

    <section class="quality-callout page-shell">
      <div>
        <p class="eyebrow">Perdenin arkasında</p>
        <h2>Güzel görünmek yetmez.<br>Ölçülebilir olmalı.</h2>
      </div>
      <div class="quality-callout__copy">
        <p>
          Sistem, butonlardan kartlara kadar her parçayı farklı ekranlarda ölçer.
          Taşma, çakışma veya kullanılamayacak kadar küçük alan varsa bunu açıkça gösterir.
        </p>
        <NuxtLink
          :to="{ path: '/ui-quality', query: $route.query }"
          class="quality-link"
          data-ui-audit="interactive"
        >
          Sistemi canlı keşfet <span>→</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page { overflow: clip; }
.hero {
  position: relative;
  padding: clamp(68px, 10vw, 132px) 0 82px;
  overflow: hidden;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-bg) 96%, #fff), var(--color-bg));
}
.hero::after {
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.28;
  content: "";
}
.hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  align-items: center;
  gap: clamp(44px, 8vw, 110px);
}
.hero__copy h1 {
  max-width: 760px;
  margin: 0;
  font-family: var(--font-display, inherit);
  font-size: clamp(3rem, 6.3vw, 6.2rem);
  font-weight: 750;
  letter-spacing: -0.065em;
  line-height: 0.93;
}
.hero__copy h1 span {
  display: block;
  color: var(--color-accent);
}
.hero__lead {
  max-width: 650px;
  margin: 28px 0 0;
  color: var(--color-text-muted);
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  line-height: 1.7;
}
.hero__proof {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 28px;
  margin-top: 30px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
}
.hero__proof span {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.hero__proof strong {
  color: var(--color-text);
  font-size: 1.15rem;
}
.hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  opacity: 0.3;
  pointer-events: none;
}
.hero__glow--one {
  width: 440px;
  height: 440px;
  top: -260px;
  right: 4%;
  background: radial-gradient(circle, var(--color-accent), transparent 67%);
}
.hero__glow--two {
  width: 260px;
  height: 260px;
  bottom: -190px;
  left: 22%;
  background: radial-gradient(circle, var(--color-primary), transparent 67%);
}
.search-panel {
  padding: 22px;
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-md);
}
.search-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 3px 4px 20px;
}
.search-panel__header > div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-panel__step {
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 13%, transparent);
  color: var(--color-accent);
  font-size: 0.7rem;
  font-weight: 900;
}
.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
}
.live-pill i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgb(34 197 94 / 0.12);
}
.search-panel__hint {
  margin: 12px 5px 2px;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}
.trust-strip {
  border-bottom: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
  background: var(--color-surface);
}
.trust-strip__inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.trust-strip__inner > div {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
  padding: 20px clamp(12px, 3vw, 32px);
  border-right: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
}
.trust-strip__inner > div:first-child { padding-left: 0; }
.trust-strip__inner > div:last-child {
  padding-right: 0;
  border-right: 0;
}
.trust-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-accent) 11%, transparent);
  color: var(--color-accent);
  font-weight: 900;
}
.trust-strip p { margin: 0; }
.trust-strip strong,
.trust-strip small { display: block; }
.trust-strip strong { font-size: 0.82rem; }
.trust-strip small {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.69rem;
}
.listings-section { padding-top: 82px; }
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}
.filter-row > p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}
.filter-row > p strong {
  color: var(--color-text);
  font-size: 1rem;
}
.results-grid { padding: 0 !important; }
.map-wrap { margin-top: 28px; }
.empty-card {
  display: grid;
  min-height: 260px;
  place-items: center;
  align-content: center;
  text-align: center;
}
.empty-card > span {
  color: var(--color-accent);
  font-size: 3rem;
}
.empty-card p {
  margin: 6px 0;
  font-size: 1.1rem;
  font-weight: 800;
}
.empty-card small { color: var(--color-text-muted); }
.quality-callout {
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  gap: clamp(40px, 10vw, 130px);
  margin-top: 94px;
  padding-block: clamp(50px, 8vw, 90px);
  border-top: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
}
.quality-callout h2 {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 4.5rem);
  letter-spacing: -0.06em;
  line-height: 0.98;
}
.quality-callout__copy {
  align-self: end;
}
.quality-callout__copy p {
  margin: 0 0 24px;
  color: var(--color-text-muted);
  line-height: 1.7;
}
.quality-link {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  min-height: 48px;
  color: var(--color-accent);
  font-weight: 850;
  text-decoration: none;
}
.quality-link span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-secondary);
}

@media (max-width: 900px) {
  .hero__inner {
    grid-template-columns: 1fr;
    gap: 44px;
  }
  .hero__copy { max-width: 760px; }
  .search-panel { max-width: 680px; }
}

@media (max-width: 720px) {
  .hero { padding-top: 58px; }
  .hero__copy h1 { font-size: clamp(2.7rem, 13vw, 4.2rem); }
  .trust-strip__inner { grid-template-columns: 1fr; }
  .trust-strip__inner > div {
    padding: 15px 0;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
  }
  .trust-strip__inner > div:last-child { border-bottom: 0; }
  .filter-row {
    display: block;
  }
  .filter-row > p { margin-bottom: 12px; }
  .quality-callout { grid-template-columns: 1fr; }
}

@media (max-width: 420px) {
  .hero__proof { gap: 12px 18px; }
  .search-panel { padding: 16px; }
  .live-pill { display: none; }
}
</style>
