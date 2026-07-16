<script setup lang="ts">
const emit = defineEmits<{ search: [city: string] }>()
const city = ref('')

function submit() {
  emit('search', city.value)
}
</script>

<template>
  <form class="search-form" data-testid="search-form" @submit.prevent="submit">
    <input
      class="search-input"
      data-testid="search-input"
      type="text"
      placeholder="Şehir ara (örn. İstanbul)"
      v-model="city"
    />
    <button class="cta-button" data-testid="search-submit" type="submit">
      Ara
    </button>
  </form>
</template>

<style scoped>
.search-form {
  display: flex;
  gap: 12px;
  padding: 24px 32px;
}
.search-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius, 8px);
  border: 1px solid var(--color-text-muted, #94A3B8);
  background: var(--color-surface, white);
  color: var(--color-text, #111);
}
</style>
