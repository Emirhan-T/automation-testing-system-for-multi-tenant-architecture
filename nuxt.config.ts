// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-09-01',
  devtools: { enabled: true },
  css: ['~/assets/base.css'],
  app: {
    head: {
      title: 'Neuron UI Quality System',
      meta: [
        {
          name: 'description',
          content: 'Her tenant ve ekran boyutunda arayüz kalitesini matematiksel olarak doğrulayan Neuron demo sistemi.'
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
