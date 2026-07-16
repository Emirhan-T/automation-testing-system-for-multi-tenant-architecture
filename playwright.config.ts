import { defineConfig, devices } from '@playwright/test'

// ---------------------------------------------------------------------------
// PLAYWRIGHT CONFIGURATION — Neuron Multi-Tenant Demo
//
// - testDir: tüm testler tests/ klasöründe gruplandırılır (katmana göre alt klasör)
// - webServer: `npm run dev` çalışmıyorsa otomatik başlatır; çalışıyorsa yeniden kullanır
// - baseURL: Demo ortamında tek sunucu; production'da her tenant'ın kendi domain'i olur
// ---------------------------------------------------------------------------
export default defineConfig({
  testDir: './tests',

  // Her test dosyası paralel çalışır; bir dosya içindeki testler sıralı
  fullyParallel: true,

  // CI ortamında yanlışlıkla `.only` bırakılmasını engelle
  forbidOnly: !!process.env.CI,

  // CI'da başarısız testleri 2 kez yeniden dene (flakiness önlemi)
  retries: process.env.CI ? 2 : 0,

  // CI'da tek worker (kaynak kısıtı), lokalde otomatik belirle
  workers: process.env.CI ? 1 : undefined,

  // HTML rapor + terminal özeti
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',

    // İlk başarısız testte tam trace kaydı al (debug için)
    trace: 'on-first-retry',

    // Screenshot sadece hata durumunda
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Gelecekte eklenebilir:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari']  } },
    // { name: 'mobile',  use: { ...devices['iPhone 14']       } },
  ],

  // Demo sunucusunu otomatik başlat/yeniden kullan
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    // Sunucu zaten çalışıyorsa yeniden başlatma (geliştirme konforu)
    reuseExistingServer: !process.env.CI,
    // Sunucunun ayağa kalkması için max bekleme süresi (ms)
    timeout: 120_000,
  },
})
