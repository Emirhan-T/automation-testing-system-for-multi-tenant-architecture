import { defineEventHandler } from 'h3'
import type { TenantConfig } from '../../config/tenants'

// Client tarafı hydration sırasında bu endpoint'i çağırarak hangi tenant'a
// ait olduğunu, hangi capability'lerin aktif olduğunu öğrenir.
export default defineEventHandler((event): TenantConfig => {
  return event.context.tenant
})
