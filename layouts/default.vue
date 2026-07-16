<script setup lang="ts">
const tenant = await useTenant()
const route = useRoute()
</script>

<template>
  <div :class="tenant?.theme" data-testid="tenant-root" :data-tenant-id="tenant?.id">
    <header class="site-header">
      <NuxtLink :to="{ path: '/', query: route.query }" class="logo" data-testid="site-logo">
        {{ tenant?.brand.logoText }}
      </NuxtLink>
      <p class="tagline">{{ tenant?.brand.tagline }}</p>
    </header>
    <main>
      <slot />
    </main>
    <footer class="site-footer">
      <small>Demo tenant: {{ tenant?.id }} · theme: {{ tenant?.theme }}</small>
    </footer>
  </div>
</template>

<style>
@import "~/assets/themes/theme1.css";
@import "~/assets/themes/theme2.css";
@import "~/assets/themes/theme3.css";
@import "~/assets/themes/theme4.css";

* { box-sizing: border-box; }
body { margin: 0; }
.logo {
  text-decoration: none;
  display: inline-block;
}
.site-footer {
  padding: 16px 32px;
  opacity: 0.6;
}
.tagline {
  color: var(--color-text-muted);
  margin: 4px 0 0;
}
</style>
