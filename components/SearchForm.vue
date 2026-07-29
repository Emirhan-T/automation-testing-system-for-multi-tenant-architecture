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
      data-ui-audit="interactive"
      type="text"
      placeholder="Şehir ara (örn. İstanbul)"
      aria-label="Şehir"
      v-model="city"
    />
    <button class="cta-button" data-testid="search-submit" data-ui-audit="interactive" type="submit">
      İlanları bul
    </button>
  </form>
</template>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  padding: 0;
}
.search-input {
  flex: 1;
  min-width: 0;
  min-height: 50px;
  padding: 13px 16px;
  border-radius: var(--radius, 8px);
  border: 1px solid var(--color-text-muted, #94A3B8);
  background: var(--color-surface, white);
  color: var(--color-text, #111);
}
.search-form .cta-button {
  min-height: 50px;
  white-space: nowrap;
}

@media (max-width: 430px) {
  .search-form { grid-template-columns: 1fr; }
  .search-form .cta-button { width: 100%; }
}
</style>
