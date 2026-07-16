<script setup lang="ts">
const tenant = await useTenant()

const { data } = await useFetch('/api/search')
const results = ref(data.value?.results ?? [])
const maxPrice = ref(Infinity)

async function onSearch(city: string) {
  const res = await $fetch('/api/search', { query: { city } })
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
  <div>
    <SearchForm @search="onSearch" />
    <PriceFilter @apply="onFilterApply" />

    <section class="results-grid" data-testid="search-results" style="padding: 0 32px 32px">
      <PropertyCard
        v-for="p in filteredResults"
        :key="p.id"
        :property="p"
      />
    </section>

    <div style="padding: 0 32px 32px" v-if="hasMap">
      <MapView />
    </div>

    <p v-if="filteredResults.length === 0" data-testid="empty-state" style="padding: 0 32px">
      Sonuç bulunamadı.
    </p>
  </div>
</template>
