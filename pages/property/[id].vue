<script setup lang="ts">
const route = useRoute()
const tenant = await useTenant()

const { data: property } = await useFetch(`/api/property/${route.params.id}`)

const hasCalculator = computed(() => tenant.value?.capabilities.includes('mortgage_calculator'))
const hasVideo = computed(() => tenant.value?.capabilities.includes('video'))
</script>

<template>
  <div style="padding: 32px" data-testid="property-detail-page">
    <template v-if="property">
      <h1 data-testid="property-title">{{ property.title }}</h1>
      <p class="muted">{{ property.city }} · {{ property.bedrooms }} oda</p>
      <p class="price" data-testid="property-price">
        {{ property.price.toLocaleString('tr-TR') }} ₺
      </p>
      <p>{{ property.description }}</p>

      <MortgageCalculator v-if="hasCalculator" :price="property.price" />
      <VideoTour v-if="hasVideo" />
    </template>
    <p v-else data-testid="not-found">İlan bulunamadı.</p>
  </div>
</template>
