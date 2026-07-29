<script setup lang="ts">
const tenant = await useTenant()
const route = useRoute()
const requestUrl = useRequestURL()

useSeoMeta({
  title: () => `${tenant.value?.name || 'Neuron'} · UI Quality System`,
  description: 'Her tenant ve ekran boyutunda arayüz kalitesini matematiksel olarak doğrulayan Neuron sistemi.',
  ogTitle: 'Neuron UI Quality System',
  ogDescription: 'Güzel görünmek yetmez. Ölçülebilir olmalı.',
  ogImage: () => new URL('/og.png', requestUrl.origin).toString(),
  twitterCard: 'summary_large_image'
})

const tenantOptions = [
  { id: 'kinetic', short: 'KH' },
  { id: 'propertycloud', short: 'PC' },
  { id: 'bydesign', short: 'BD' },
  { id: 'harrisons', short: 'HK' }
]
</script>

<template>
  <div :class="tenant?.theme" data-testid="tenant-root" :data-tenant-id="tenant?.id">
    <a href="#main-content" class="skip-link">İçeriğe geç</a>
    <header class="site-header">
      <div class="header-inner">
        <div class="brand-lockup">
          <NuxtLink
            :to="{ path: '/', query: route.query }"
            class="logo"
            data-testid="site-logo"
            data-ui-audit="interactive"
          >
            <span class="logo-mark" aria-hidden="true">N</span>
            <span>
              <strong>{{ tenant?.brand.logoText }}</strong>
              <small>Neuron quality network</small>
            </span>
          </NuxtLink>
        </div>

        <nav class="main-nav" aria-label="Ana menü">
          <NuxtLink :to="{ path: '/', query: route.query }">İlanlar</NuxtLink>
          <NuxtLink :to="{ path: '/ui-quality', query: route.query }">UI Quality Center</NuxtLink>
        </nav>

        <div class="tenant-switcher" aria-label="Tenant seçimi">
          <span class="tenant-switcher__label">Tenant</span>
          <NuxtLink
            v-for="option in tenantOptions"
            :key="option.id"
            :to="{ path: route.path, query: { ...route.query, tenant: option.id } }"
            :class="{ active: tenant?.id === option.id }"
            :aria-label="`${option.id} tenant'ına geç`"
            :aria-current="tenant?.id === option.id ? 'true' : undefined"
            data-ui-audit="interactive"
            data-ui-min-size="32"
          >
            {{ option.short }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <main id="main-content">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <strong>Neuron UI Quality System</strong>
          <p>Her ekranda anlaşılır, erişilebilir ve ölçülebilir arayüzler.</p>
        </div>
        <div class="footer-status">
          <span class="status-dot" />
          <span>{{ tenant?.id }} · {{ tenant?.theme }} aktif</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import "~/assets/themes/theme1.css";
@import "~/assets/themes/theme2.css";
@import "~/assets/themes/theme3.css";
@import "~/assets/themes/theme4.css";

* { box-sizing: border-box; }

.skip-link {
  position: fixed;
  z-index: 100;
  top: 10px;
  left: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  transform: translateY(-160%);
}
.skip-link:focus { transform: translateY(0); }
.site-header {
  position: relative;
  z-index: 10;
  border-bottom: 1px solid color-mix(in srgb, var(--color-text, #172033) 9%, transparent);
}
.header-inner,
.footer-inner {
  width: min(var(--page-max), calc(100% - (var(--page-gutter) * 2)));
  margin-inline: auto;
}
.header-inner {
  display: grid;
  grid-template-columns: minmax(230px, 1fr) auto minmax(230px, 1fr);
  align-items: center;
  gap: 28px;
  min-height: 82px;
}
.logo {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  min-height: 44px;
  color: inherit;
  text-decoration: none;
}
.logo-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 12px;
  background: var(--color-accent);
  color: var(--color-secondary);
  font-size: 1rem;
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.18);
}
.logo strong,
.logo small { display: block; }
.logo strong { line-height: 1.15; }
.logo small {
  margin-top: 3px;
  color: var(--color-text-muted);
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.main-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-surface) 78%, transparent);
}
.main-nav a {
  min-height: 40px;
  padding: 10px 15px;
  border-radius: 999px;
  color: inherit;
  font-size: 0.85rem;
  font-weight: 750;
  text-decoration: none;
  white-space: nowrap;
}
.main-nav a.router-link-active {
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.tenant-switcher {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}
.tenant-switcher__label {
  margin-right: 5px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tenant-switcher a {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
  border-radius: 50%;
  color: inherit;
  font-size: 0.68rem;
  font-weight: 850;
  text-decoration: none;
}
.tenant-switcher a.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-secondary);
}
.site-footer {
  margin-top: 64px;
  padding: 32px 0;
  border-top: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.footer-inner strong { letter-spacing: -0.02em; }
.footer-inner p {
  margin: 5px 0 0;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}
.footer-status {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 5px rgb(34 197 94 / 0.12);
}

@media (max-width: 960px) {
  .header-inner {
    grid-template-columns: 1fr auto;
  }
  .main-nav {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: center;
    margin-bottom: 12px;
  }
}

@media (max-width: 640px) {
  .header-inner {
    min-height: 72px;
    gap: 10px;
  }
  .logo small,
  .tenant-switcher__label { display: none; }
  .tenant-switcher a {
    width: 34px;
    height: 34px;
  }
  .main-nav {
    width: 100%;
  }
  .main-nav a {
    flex: 1;
    text-align: center;
  }
  .footer-inner {
    display: block;
  }
  .footer-status { margin-top: 18px; }
}

@media (max-width: 360px) {
  .logo > span:last-child { display: none; }
  .logo-mark {
    width: 44px;
    height: 44px;
  }
}
</style>
