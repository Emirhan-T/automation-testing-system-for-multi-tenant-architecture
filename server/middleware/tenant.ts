import { defineEventHandler, getHeader, getQuery } from 'h3'
import { resolveTenant, defaultTenant } from '../../config/tenants'

// ---------------------------------------------------------------------------
// TENANT RESOLUTION MIDDLEWARE
//
// Gerçek Neuron platformunda tenant, isteğin geldiği domain'e göre belirlenir
// (örn. kinetic-homes.com -> kinetic tenant'ı). Bu demo ortamında gerçek
// domain'ler olmadığı için 3 kademeli bir çözüm sırası kullanıyoruz -  bu
// aynı zamanda Playwright testlerinin tenant'ı kontrollü şekilde
// değiştirebilmesini sağlıyor:
//
//   1) x-tenant header'ı        (otomasyon / test amaçlı, prod'da kapalı olur)
//   2) hostname eşleşmesi       (gerçek prod senaryosu: domain -> tenant)
//   3) ?tenant= query parametresi (yerel geliştirme / manuel tarayıcı testi)
//
// Sonuç event.context.tenant içine yazılır, tüm server route'ları ve
// composables buradan okur. Bu, "SSR + per-request tenant resolution"
// prensibinin küçük ölçekli birebir uygulamasıdır.
// ---------------------------------------------------------------------------
export default defineEventHandler((event) => {
  const headerTenant = getHeader(event, 'x-tenant')
  const host = getHeader(event, 'host') || ''
  const query = getQuery(event)
  const queryTenant = typeof query.tenant === 'string' ? query.tenant : ''

  const lookupKey = headerTenant || queryTenant || host

  const tenant = resolveTenant(lookupKey || '') || defaultTenant

  event.context.tenant = tenant
})
