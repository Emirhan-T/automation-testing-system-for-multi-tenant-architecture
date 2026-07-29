<script setup lang="ts">
const route = useRoute()
const tenant = await useTenant()

const { data: property } = await useFetch(`/api/property/${route.params.id}`, {
  headers: tenantHeaders()
})

const hasCalculator = computed(() => tenant.value?.capabilities.includes('mortgage_calculator'))
const hasVideo = computed(() => tenant.value?.capabilities.includes('video'))
</script>

<template>
  <div class="detail-page page-shell" data-testid="property-detail-page">
    <template v-if="property">
      <NuxtLink :to="{ path: '/', query: route.query }" class="back-link" data-ui-audit="interactive">
        ← Tüm ilanlara dön
      </NuxtLink>

      <div class="detail-grid">
        <div class="detail-visual surface-card" aria-label="İlan görsel alanı">
          <span>{{ property.city }}</span>
          <div class="detail-visual__building" />
        </div>

        <div class="detail-content">
          <p class="eyebrow">Seçkin portföy</p>
          <h1 data-testid="property-title" data-ui-audit="text">{{ property.title }}</h1>
          <p class="detail-meta">{{ property.city }} · {{ property.bedrooms }} oda · Satılık</p>
          <p class="price" data-testid="property-price">
            {{ property.price.toLocaleString('tr-TR') }} ₺
          </p>
          <p class="description">{{ property.description }}</p>

          <div class="detail-facts">
            <div><strong>{{ property.bedrooms }}</strong><span>Yatak odası</span></div>
            <div><strong>16:9</strong><span>Görsel standardı</span></div>
            <div><strong>✓</strong><span>UI kontrolünden geçti</span></div>
          </div>
        </div>
      </div>

      <div class="detail-modules">
        <MortgageCalculator v-if="hasCalculator" :price="property.price" />
        <VideoTour v-if="hasVideo" />
      </div>
    </template>
    <div v-else class="not-found surface-card">
      <span>404</span>
      <h1>Bu ilanı bulamadık.</h1>
      <p data-testid="not-found">İlan kaldırılmış veya adresi değişmiş olabilir.</p>
      <NuxtLink :to="{ path: '/', query: route.query }" class="cta-button">Ana sayfaya dön</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.detail-page { padding-top: 40px; }
.back-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: 24px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 750;
  text-decoration: none;
}
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(340px, 0.88fr);
  align-items: center;
  gap: clamp(38px, 7vw, 86px);
}
.detail-visual {
  position: relative;
  display: flex;
  min-height: 500px;
  align-items: flex-end;
  overflow: hidden;
  padding: 26px;
  background:
    radial-gradient(circle at 74% 20%, color-mix(in srgb, var(--color-accent) 75%, white) 0 7%, transparent 8%),
    linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 80%, white), var(--color-accent));
}
.detail-visual > span {
  position: relative;
  z-index: 2;
  padding: 8px 12px;
  border: 1px solid rgb(255 255 255 / 0.25);
  border-radius: 999px;
  background: rgb(15 23 42 / 0.25);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  backdrop-filter: blur(8px);
}
.detail-visual__building {
  position: absolute;
  inset: 23% 10% 0;
  clip-path: polygon(8% 100%, 8% 34%, 36% 14%, 36% 35%, 58% 0, 91% 28%, 91% 100%);
  background:
    linear-gradient(90deg, transparent 47%, rgb(255 255 255 / .25) 48% 52%, transparent 53%),
    repeating-linear-gradient(0deg, rgb(255 255 255 / .18) 0 8px, transparent 9px 42px),
    rgb(255 255 255 / .20);
  box-shadow: 0 30px 80px rgb(15 23 42 / .18);
}
.detail-content h1 {
  margin: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-display, inherit);
  font-size: clamp(2.5rem, 5vw, 5rem);
  letter-spacing: -0.06em;
  line-height: 0.97;
}
.detail-meta {
  margin: 20px 0 0;
  color: var(--color-text-muted);
}
.detail-content .price {
  margin: 14px 0 0;
  color: var(--color-accent);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 850;
}
.description {
  max-width: 520px;
  margin: 22px 0 0;
  color: var(--color-text-muted);
  line-height: 1.75;
}
.detail-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin-top: 30px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  border-radius: max(var(--radius, 10px), 12px);
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
}
.detail-facts > div {
  min-width: 0;
  padding: 15px 12px;
  background: var(--color-surface);
}
.detail-facts strong,
.detail-facts span { display: block; }
.detail-facts strong { font-size: 1.05rem; }
.detail-facts span {
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 0.66rem;
  line-height: 1.25;
}
.detail-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
  gap: 24px;
  margin-top: 42px;
}
.detail-modules :deep(.calculator),
.detail-modules :deep(.video-tour) {
  height: 100%;
  margin-top: 0;
}
.not-found {
  display: grid;
  min-height: 520px;
  place-items: center;
  align-content: center;
  margin-top: 30px;
  padding: 30px;
  text-align: center;
}
.not-found > span {
  color: var(--color-accent);
  font-size: 5rem;
  font-weight: 900;
  letter-spacing: -0.08em;
}
.not-found h1 {
  margin: 4px 0;
  font-size: 2rem;
}
.not-found p { color: var(--color-text-muted); }
.not-found a {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  margin-top: 15px;
  text-decoration: none;
}

@media (max-width: 880px) {
  .detail-grid { grid-template-columns: 1fr; }
  .detail-visual { min-height: min(68vw, 500px); }
  .detail-content { max-width: 720px; }
}

@media (max-width: 430px) {
  .detail-page { padding-top: 22px; }
  .detail-visual { min-height: 320px; }
  .detail-facts { grid-template-columns: 1fr; }
}
</style>
