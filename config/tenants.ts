// ---------------------------------------------------------------------------
// TENANT REGISTRY / CAPABILITY MATRIX
// Gerçek Neuron sisteminde bu veri CMS/DB'den gelir. Bu demo'da statik
// tanımlanmıştır ama server middleware tarafından aynı şekilde tüketilir.
// ---------------------------------------------------------------------------

export type Capability =
  | 'search'
  | 'property_detail'
  | 'mortgage_calculator'
  | 'video'
  | 'map'

export interface TenantConfig {
  id: string
  name: string
  domainHints: string[]   // prod'da hostname eşleşmesi için
  theme: 'theme1' | 'theme2' | 'theme3' | 'theme4'
  capabilities: Capability[]
  brand: {
    primary: string
    secondary: string
    accent: string
    logoText: string
    tagline: string
  }
}

export const tenants: TenantConfig[] = [
  {
    id: 'kinetic',
    name: 'Kinetic Homes',
    domainHints: ['kinetic', 'localhost:3000'],
    theme: 'theme1',
    capabilities: ['search', 'property_detail', 'mortgage_calculator', 'video', 'map'],
    brand: {
      primary: '#0B3D91',
      secondary: '#0F172A',
      accent: '#22D3EE',
      logoText: 'Kinetic Homes',
      tagline: 'Hız kesmeden ev bul.'
    }
  },
  {
    id: 'propertycloud',
    name: 'Property Cloud',
    domainHints: ['propertycloud'],
    theme: 'theme2',
    capabilities: ['search', 'property_detail', 'map'],
    brand: {
      primary: '#78716C',
      secondary: '#F5F5F4',
      accent: '#EA580C',
      logoText: 'Property Cloud',
      tagline: 'Sade. Net. Hızlı arama.'
    }
  },
  {
    id: 'bydesign',
    name: 'ByDesign Estates',
    domainHints: ['bydesign'],
    theme: 'theme3',
    capabilities: ['search', 'property_detail', 'mortgage_calculator'],
    brand: {
      primary: '#18181B',
      secondary: '#FDF4FF',
      accent: '#DB2777',
      logoText: 'ByDesign Estates',
      tagline: 'Tasarımla yaşanacak evler.'
    }
  },
  {
    id: 'harrisons',
    name: 'Harrisons & Keystone',
    domainHints: ['harrisons', 'keystone'],
    theme: 'theme4',
    capabilities: ['search', 'property_detail'],
    brand: {
      primary: '#14532D',
      secondary: '#FEFCE8',
      accent: '#CA8A04',
      logoText: 'Harrisons & Keystone',
      tagline: 'Geleneksel güven, köklü tecrübe.'
    }
  }
]

export function resolveTenant(key: string): TenantConfig | undefined {
  const k = key.toLowerCase()
  return tenants.find(
    t => t.id === k || t.domainHints.some(h => k.includes(h))
  )
}

export const defaultTenant = tenants[0]
