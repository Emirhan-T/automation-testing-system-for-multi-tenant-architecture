import type { TenantConfig } from '~/config/tenants'

// SSR sırasında server middleware'in belirlediği tenant'ı çekip
// tüm sayfa/component ağacına tek noktadan sağlar. useState ile
// hydration boyunca aynı state korunur (server -> client tutarlılığı).
export async function useTenant() {
  const tenant = useState<TenantConfig | null>('tenant', () => {
    if (import.meta.server) {
      const event = useRequestEvent()
      return event?.context.tenant || null
    }
    return null
  })

  if (!tenant.value) {
    const { data } = await useFetch<TenantConfig>('/api/tenant-config', {
      headers: tenantHeaders()
    })
    tenant.value = data.value
  }

  return tenant
}

export function tenantHeaders() {
  // Test/otomasyon amaçlı: istemci tarafında tenant override query'sini
  // API çağrılarına da header olarak taşımak için kullanılabilir.
  if (import.meta.client) {
    const url = new URL(window.location.href)
    const t = url.searchParams.get('tenant')
    return t ? { 'x-tenant': t } : {}
  }
  return {}
}
