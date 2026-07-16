import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const tenant = event.context.tenant

  // Capability kapalıysa API seviyesinde de reddediyoruz - UI'daki
  // capability gizleme tek savunma katmanı olmamalı.
  if (!tenant.capabilities.includes('mortgage_calculator')) {
    throw createError({ statusCode: 403, statusMessage: 'Capability not enabled for this tenant' })
  }

  const body = await readBody<{ price: number; deposit: number; years?: number }>(event)
  const years = body.years ?? 25
  const principal = Math.max(body.price - body.deposit, 0)
  const annualRate = 0.035
  const monthlyRate = annualRate / 12
  const n = years * 12

  const monthlyPayment =
    principal > 0
      ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
      : 0

  return {
    principal,
    years,
    monthlyPayment: Math.round(monthlyPayment)
  }
})
