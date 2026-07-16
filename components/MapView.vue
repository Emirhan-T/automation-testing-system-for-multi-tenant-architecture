<script setup lang="ts">
const visible = ref(false)
</script>

<template>
  <section class="map-section" data-testid="map-section">
    <button class="cta-button" data-testid="map-toggle" @click="visible = !visible">
      {{ visible ? 'Haritayı Gizle' : 'Haritada Göster' }}
    </button>
    <div v-if="visible" class="map-placeholder" data-testid="map-container">
      🗺 Harita gösterimi (demo)
    </div>
  </section>
</template>

<style scoped>
.map-section {
  margin-top: 24px;
}
.map-placeholder {
  height: 220px;
  background: #e2e8f0;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius, 8px);
  margin-top: 12px;
}
</style>
