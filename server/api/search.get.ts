import { defineEventHandler, getQuery } from 'h3'
import { properties } from '../data/properties'

// -----------------------------------------------------------------------
// CONTRACT: bu endpoint tenant fark etmeksizin HER ZAMAN şu şemayı döner:
// { results: Property[], totalCount: number }
// Katman 5 (API Contract Test) bu şemayı doğrular.
// -----------------------------------------------------------------------
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const city = typeof query.city === 'string' ? query.city.trim().toLowerCase() : ''

  const results = city
    ? properties.filter(p => p.city.toLowerCase().includes(city))
    : properties

  return {
    results,
    totalCount: results.length,
    tenant: event.context.tenant.id // debug/gözlemlenebilirlik amaçlı
  }
})
