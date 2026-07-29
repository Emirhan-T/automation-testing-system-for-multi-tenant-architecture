<script setup lang="ts">
const route = useRoute()
defineProps<{
  property: {
    id: string
    title: string
    city: string
    price: number
    bedrooms: number
  }
}>()
</script>

<template>
  <NuxtLink
    :to="{ path: `/property/${property.id}`, query: route.query }"
    class="property-card"
    data-testid="search-results-item"
    data-ui-audit="container"
  >
    <div class="property-card__image">
      <span class="property-card__badge">{{ property.bedrooms }}+1</span>
      <span class="property-card__view">İlanı incele →</span>
    </div>
    <div class="property-card__body">
      <p class="property-card__meta">{{ property.city }} · Satılık</p>
      <h3 data-testid="property-card-title" data-ui-audit="text">{{ property.title }}</h3>
      <p class="muted">{{ property.city }} · {{ property.bedrooms }} oda</p>
      <p class="price" data-testid="property-card-price">
        {{ property.price.toLocaleString('tr-TR') }} ₺
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.property-card {
  display: block;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}
.property-card__image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background:
    radial-gradient(circle at 72% 25%, color-mix(in srgb, var(--color-accent) 70%, white) 0 9%, transparent 10%),
    linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 78%, #fff), var(--color-accent));
}
.property-card__image::before,
.property-card__image::after {
  position: absolute;
  content: "";
}
.property-card__image::before {
  inset: auto 8% 0;
  height: 62%;
  clip-path: polygon(0 55%, 24% 18%, 39% 39%, 62% 0, 100% 48%, 100% 100%, 0 100%);
  background: rgb(255 255 255 / 0.19);
}
.property-card__image::after {
  inset: auto 0 0;
  height: 42%;
  background: linear-gradient(transparent, rgb(0 0 0 / 0.32));
}
.property-card__badge,
.property-card__view {
  position: absolute;
  z-index: 1;
  color: white;
  font-size: 0.69rem;
  font-weight: 800;
}
.property-card__badge {
  top: 14px;
  left: 14px;
  padding: 7px 9px;
  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: 999px;
  background: rgb(15 23 42 / 0.28);
  backdrop-filter: blur(8px);
}
.property-card__view {
  right: 15px;
  bottom: 14px;
  opacity: 0;
  transform: translateY(5px);
  transition: 160ms ease;
}
.property-card:hover .property-card__view {
  opacity: 1;
  transform: translateY(0);
}
.property-card__body {
  padding: 19px;
}
.property-card__meta {
  margin: 0 0 8px;
  color: var(--color-accent);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.property-card h3 {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: clamp(1.05rem, 2vw, 1.28rem);
  letter-spacing: -0.025em;
  line-height: 1.2;
}
.muted {
  color: var(--color-text-muted, #666);
  font-size: 0.9rem;
  margin-bottom: 0;
}
.price {
  font-weight: 700;
  margin-top: 8px;
  font-size: 1.08rem;
}
</style>
