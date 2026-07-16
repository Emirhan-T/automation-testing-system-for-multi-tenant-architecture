export interface Property {
  id: string
  title: string
  city: string
  price: number
  bedrooms: number
  image: string
  description: string
}

// Tüm tenant'lar aynı property havuzunu paylaşıyor (gerçek Neuron'da her
// tenant'ın kendi ilan verisi olur, ama API sözleşmesi/şeması ortaktır).
export const properties: Property[] = [
  {
    id: 'p1',
    title: 'Boğaz Manzaralı 3+1 Daire',
    city: 'İstanbul',
    price: 8500000,
    bedrooms: 3,
    image: '/images/p1.jpg',
    description: 'Şehrin merkezinde, boğaz manzaralı ferah bir daire.'
  },
  {
    id: 'p2',
    title: 'Müstakil Bahçeli Villa',
    city: 'İstanbul',
    price: 15250000,
    bedrooms: 5,
    image: '/images/p2.jpg',
    description: 'Geniş bahçeli, özel havuzlu müstakil villa.'
  },
  {
    id: 'p3',
    title: 'Merkezi Konumda 2+1',
    city: 'Ankara',
    price: 3200000,
    bedrooms: 2,
    image: '/images/p3.jpg',
    description: 'Toplu taşımaya yürüme mesafesinde kompakt daire.'
  },
  {
    id: 'p4',
    title: 'Deniz Kenarı Yazlık',
    city: 'İzmir',
    price: 6100000,
    bedrooms: 3,
    image: '/images/p4.jpg',
    description: 'Sahile 200 metre, yazlık kullanıma uygun.'
  }
]
