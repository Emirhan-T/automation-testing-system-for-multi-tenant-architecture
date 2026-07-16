import { defineEventHandler, createError, getRouterParam } from 'h3'
import { properties } from '../../data/properties'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const property = properties.find(p => p.id === id)

  if (!property) {
    throw createError({ statusCode: 404, statusMessage: 'Property not found' })
  }

  return property
})
