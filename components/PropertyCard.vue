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
  >
    <div class="property-card__image" />
    <div class="property-card__body">
      <h3 data-testid="property-card-title">{{ property.title }}</h3>
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
  text-decoration: none;
  color: inherit;
}
.property-card__image {
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, var(--color-primary, #ccc), var(--color-accent, #999));
}
.property-card__body {
  padding: 16px;
}
.muted {
  color: var(--color-text-muted, #666);
  font-size: 0.9rem;
}
.price {
  font-weight: 700;
  margin-top: 8px;
}
</style>
