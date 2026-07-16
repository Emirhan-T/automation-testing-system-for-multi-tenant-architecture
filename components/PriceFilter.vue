<script setup lang="ts">
const emit = defineEmits<{ apply: [maxPrice: number] }>()
const maxPrice = ref('')

function apply() {
  emit('apply', Number(maxPrice.value) || Infinity)
}
</script>

<template>
  <div class="price-filter" data-testid="price-filter">
    <input
      type="number"
      placeholder="Maks. fiyat"
      data-testid="filter-price-max"
      v-model="maxPrice"
    />
    <button class="cta-button" data-testid="filter-apply" @click="apply">
      Filtrele
    </button>
  </div>
</template>

<style scoped>
.price-filter {
  display: flex;
  gap: 8px;
  padding: 0 32px 16px;
}
.price-filter input {
  padding: 8px 12px;
  border-radius: var(--radius, 8px);
  border: 1px solid var(--color-text-muted, #94A3B8);
}
</style>
