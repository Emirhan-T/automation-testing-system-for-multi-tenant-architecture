<script setup lang="ts">
const route = useRoute()

const containerWidth = ref(220)
const label = ref('İlanları görüntüle')
const demoButton = ref<HTMLElement | null>(null)
const measurement = ref({
  available: 0,
  required: 0,
  fits: true
})

const viewports = [
  { name: 'Küçük mobil', width: 320, icon: '▯' },
  { name: 'Mobil', width: 375, icon: '▯' },
  { name: 'Tablet', width: 768, icon: '▭' },
  { name: 'Laptop', width: 1024, icon: '▰' },
  { name: 'Masaüstü', width: 1440, icon: '▰' }
]

const rules = [
  {
    number: '01',
    title: 'Yazı kutuya sığıyor mu?',
    explanation: 'Yazının ihtiyaç duyduğu alan, butonun kullanılabilir alanından büyükse sistem hata verir.',
    formula: 'yazı genişliği ≤ kullanılabilir genişlik',
    tone: 'violet'
  },
  {
    number: '02',
    title: 'Bileşen ekranda mı?',
    explanation: 'Kartın veya formun sağ kenarı ekranın dışına çıkarsa kullanıcı içeriği kaybeder.',
    formula: 'sağ kenar ≤ ekran genişliği',
    tone: 'cyan'
  },
  {
    number: '03',
    title: 'Rahatça dokunuluyor mu?',
    explanation: 'Butonlar parmakla rahat kullanılabilecek minimum genişlik ve yüksekliğe sahip olmalı.',
    formula: 'genişlik ve yükseklik ≥ 44 px',
    tone: 'lime'
  },
  {
    number: '04',
    title: 'Parçalar çakışıyor mu?',
    explanation: 'İki bağımsız bileşenin kapladığı alan kesişirse sistem çakışma miktarını hesaplar.',
    formula: 'kesişim alanı = 0',
    tone: 'orange'
  }
]

const viewportLabWidth = ref(280)
const viewportCardWidth = ref(220)
const viewportCardOffset = ref(20)
const viewportRightEdge = computed(() => viewportCardOffset.value + viewportCardWidth.value)
const viewportOverflow = computed(() => Math.max(0, viewportRightEdge.value - viewportLabWidth.value))
const viewportFits = computed(() => viewportOverflow.value === 0)

const overlapDistance = ref(90)
const virtualCardWidth = 140
const virtualCardHeight = 90
const overlapWidth = computed(() => Math.max(0, virtualCardWidth - overlapDistance.value))
const overlapArea = computed(() => overlapWidth.value * virtualCardHeight)
const cardsOverlap = computed(() => overlapArea.value > 0)

const touchSize = ref(36)
const touchPasses = computed(() => touchSize.value >= 44)

const testLayers = [
  {
    id: 'contract',
    number: '01',
    title: 'Veri sözleşmesi',
    question: 'Doğru veri geldi mi?',
    explanation: 'Sayfanın görünüşüne bakmadan API yanıtındaki zorunlu alanları ve veri tiplerini doğrular.',
    example: 'results: liste · totalCount: sayı · tenantId: metin',
    catches: ['Eksik ilan alanı', 'Yanlış veri tipi', 'Tenant karışması']
  },
  {
    id: 'behavior',
    number: '02',
    title: 'Anlamsal davranış',
    question: 'Kullanıcı işini tamamlayabiliyor mu?',
    explanation: 'Sabit CSS seçicileri yerine arama, filtreleme ve detay açma gibi kullanıcı niyetini test eder.',
    example: 'Arama yap → sonuç gör → ilana git',
    catches: ['Çalışmayan filtre', 'Kırık yönlendirme', 'Boş sonuç durumu']
  },
  {
    id: 'ssr',
    number: '03',
    title: 'SSR ve tenant',
    question: 'Sunucu doğru siteyi mi hazırladı?',
    explanation: 'İlk HTML ile tarayıcıda canlanan uygulamanın aynı tenant yapılandırmasını kullandığını kontrol eder.',
    example: 'domain → tenant config → SSR HTML → hydration',
    catches: ['Yanlış tema', 'Hydration farkı', 'Eksik runtime config']
  },
  {
    id: 'geometry',
    number: '04',
    title: 'Geometri',
    question: 'Arayüz fiziksel olarak kullanılabilir mi?',
    explanation: 'Bileşenlerin gerçek koordinatlarını, içerik ölçülerini ve dokunma alanlarını matematiksel olarak inceler.',
    example: 'scrollWidth ≤ clientWidth · kesişim alanı = 0',
    catches: ['Yazı taşması', 'Ekran dışına çıkma', 'Bileşen çakışması']
  }
]

const activeLayerId = ref('contract')
const activeLayer = computed(() =>
  testLayers.find(layer => layer.id === activeLayerId.value) || testLayers[0]
)

const scenarioTenants = [
  { id: 'kinetic', name: 'Kinetic', theme: 'Teknik / koyu', modules: 5 },
  { id: 'propertycloud', name: 'Property Cloud', theme: 'Editoryal / sade', modules: 3 },
  { id: 'bydesign', name: 'ByDesign', theme: 'Brütalist / canlı', modules: 3 },
  { id: 'harrisons', name: 'Harrisons', theme: 'Klasik / lüks', modules: 2 }
]
const scenarioPages = [
  { id: 'home', name: 'Ana sayfa' },
  { id: 'property', name: 'İlan detayı' },
  { id: 'quality', name: 'Kalite merkezi' }
]
const scenarioTenantId = ref('kinetic')
const scenarioPageId = ref('home')
const scenarioViewport = ref(375)
const scenarioGenerated = ref(false)
const selectedScenarioTenant = computed(() =>
  scenarioTenants.find(tenant => tenant.id === scenarioTenantId.value) || scenarioTenants[0]
)
const selectedScenarioPage = computed(() =>
  scenarioPages.find(page => page.id === scenarioPageId.value) || scenarioPages[0]
)
const scenarioChecks = [
  'Domain ve tenant çözümleme',
  'API veri sözleşmesi',
  'Ana kullanıcı davranışı',
  'SSR ile hydration tutarlılığı',
  'Responsive geometri kuralları'
]

watch([scenarioTenantId, scenarioPageId, scenarioViewport], () => {
  scenarioGenerated.value = false
})

const reviewMode = ref<'automatic' | 'manual'>('automatic')
const reviewModes = {
  automatic: {
    title: 'Otomasyona uygun',
    description: 'Kesin formülü, beklenen sonucu veya tekrarlanabilir kullanıcı davranışı olan kontroller.',
    items: ['API alanları ve veri tipleri', 'Arama–filtreleme akışı', 'Taşma, çakışma ve dokunma alanı', 'SSR tenant tutarlılığı']
  },
  manual: {
    title: 'İnsan değerlendirmesi gerekir',
    description: 'Marka hissi ve estetik kalite gibi tek bir matematiksel doğruya indirgenemeyen kararlar.',
    items: ['Görsel hiyerarşi iyi mi?', 'Fotoğraf seçimi markaya uygun mu?', 'Metnin tonu ikna edici mi?', 'Tasarım ajansın kimliğini yansıtıyor mu?']
  }
}

function measure() {
  if (!demoButton.value) return
  const el = demoButton.value
  measurement.value = {
    available: el.clientWidth,
    required: el.scrollWidth,
    fits: el.scrollWidth <= el.clientWidth + 1
  }
}

watch([containerWidth, label], async () => {
  await nextTick()
  measure()
})

onMounted(() => {
  measure()
  const observer = new ResizeObserver(measure)
  if (demoButton.value) observer.observe(demoButton.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <div class="quality-page">
    <section class="quality-hero">
      <div class="quality-hero__grid" aria-hidden="true" />
      <div class="page-shell quality-hero__inner">
        <div>
          <p class="eyebrow">Neuron UI Quality Center</p>
          <h1 data-ui-audit="text">
            Arayüz kalitesini<br>
            <span>gözle değil, veriyle</span><br>
            doğruluyoruz.
          </h1>
          <p>
            Sistem her sayfayı farklı ekran boyutlarında açar, bileşenleri ölçer
            ve kullanıcı sorun yaşamadan önce hatayı anlaşılır bir rapora dönüştürür.
          </p>
        </div>

        <div class="quality-score surface-card" data-ui-audit="container">
          <div class="score-ring">
            <div><strong>5</strong><span>ekran</span></div>
          </div>
          <div>
            <span class="quality-score__label">Temel tarama kapsamı</span>
            <strong>4 tenant × 3 deneyim</strong>
            <small>Her tasarım aynı kalite kurallarıyla ölçülür.</small>
          </div>
        </div>
      </div>
    </section>

    <section class="plain-language page-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">En basit anlatımla</p>
          <h2>Bir kalite kontrol bandı gibi çalışır.</h2>
        </div>
        <p>
          Nasıl fabrikada her ürünün ölçüsü kontrol ediliyorsa, burada da her
          butonun, kartın ve yazının dijital ölçüsü kontrol edilir.
        </p>
      </div>

      <div class="process-grid">
        <article>
          <span>1</span>
          <div class="process-visual process-visual--screens" aria-hidden="true">
            <i /><i /><i />
          </div>
          <h3>Sayfayı oluştur</h3>
          <p>Her tenant ve ekran boyutu için gerçek sayfa tarayıcıda açılır.</p>
        </article>
        <article>
          <span>2</span>
          <div class="process-visual process-visual--measure" aria-hidden="true">
            <i>184 px</i>
          </div>
          <h3>Her parçayı ölç</h3>
          <p>Yazı, kutu, boşluk ve ekran sınırları matematiksel olarak okunur.</p>
        </article>
        <article>
          <span>3</span>
          <div class="process-visual process-visual--report" aria-hidden="true">
            <i>✓</i><i>!</i>
          </div>
          <h3>Sonucu anlat</h3>
          <p>Hatalı bileşen, nedeni ve gerçek ölçüleriyle raporlanır.</p>
        </article>
      </div>
    </section>

    <section class="lab-section">
      <div class="page-shell">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Canlı matematik laboratuvarı</p>
            <h2>Bir butonu kendin test et.</h2>
          </div>
          <p>
            Kutuyu daralt veya yazıyı uzat. Sistem, yazının ihtiyaç duyduğu alanı
            butonun mevcut alanıyla anında karşılaştırır.
          </p>
        </div>

        <div class="lab-card surface-card">
          <div class="lab-controls">
            <label>
              <span>Buton genişliği <strong>{{ containerWidth }} px</strong></span>
              <input
                v-model.number="containerWidth"
                type="range"
                min="80"
                max="320"
                step="1"
                data-ui-audit="interactive"
              >
            </label>
            <label>
              <span>Butonun içindeki yazı</span>
              <input
                v-model="label"
                type="text"
                maxlength="60"
                data-ui-audit="interactive"
              >
            </label>

            <div class="formula-box">
              <span>Kontrol formülü</span>
              <code>{{ measurement.required }} px ≤ {{ measurement.available }} px</code>
            </div>
          </div>

          <div class="lab-stage" :class="{ 'is-error': !measurement.fits }">
            <div class="ruler" :style="{ width: `${containerWidth}px` }">
              <span>0</span><span>{{ containerWidth }} px</span>
            </div>
            <button
              ref="demoButton"
              class="demo-button"
              :style="{ width: `${containerWidth}px` }"
              type="button"
            >
              {{ label || 'Boş buton' }}
            </button>

            <div class="lab-result" aria-live="polite">
              <span>{{ measurement.fits ? '✓' : '!' }}</span>
              <div>
                <strong>{{ measurement.fits ? 'Kontrol başarılı' : 'Taşma tespit edildi' }}</strong>
                <p v-if="measurement.fits">
                  Yazı için yeterli alan var. {{ measurement.available - measurement.required }} px boşluk kaldı.
                </p>
                <p v-else>
                  Yazı, kullanılabilir alandan {{ measurement.required - measurement.available }} px daha geniş.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="experiment-section page-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Üç canlı deney daha</p>
          <h2>Hatanın nasıl oluştuğunu gör.</h2>
        </div>
        <p>
          Değerleri değiştirerek ekran taşmasını, bileşen çakışmasını ve küçük
          dokunma alanlarını gerçek zamanlı inceleyebilirsin.
        </p>
      </div>

      <div class="experiment-grid">
        <article class="experiment-card surface-card">
          <div class="experiment-card__head">
            <span>Deney 02</span>
            <strong :class="viewportFits ? 'status-pass' : 'status-error'">
              {{ viewportFits ? 'Geçti' : 'Taşıyor' }}
            </strong>
          </div>
          <h3>Ekran sınırı</h3>
          <p>Kartın sağ kenarı, ekranın sağ kenarını geçmemeli.</p>
          <div class="mini-controls">
            <label>
              <span>Ekran <strong>{{ viewportLabWidth }} px</strong></span>
              <input v-model.number="viewportLabWidth" type="range" min="180" max="360" data-ui-audit="interactive">
            </label>
            <label>
              <span>Kart <strong>{{ viewportCardWidth }} px</strong></span>
              <input v-model.number="viewportCardWidth" type="range" min="120" max="360" data-ui-audit="interactive">
            </label>
          </div>
          <div class="viewport-lab" :class="{ 'is-failing': !viewportFits }">
            <div class="viewport-lab__screen">
              <span>{{ viewportLabWidth }} px ekran</span>
              <div
                class="viewport-lab__card"
                :style="{
                  width: `${Math.min(100, (viewportCardWidth / viewportLabWidth) * 100)}%`,
                  marginLeft: `${Math.min(18, (viewportCardOffset / viewportLabWidth) * 100)}%`
                }"
              >
                İlan kartı
              </div>
            </div>
          </div>
          <div class="experiment-formula">
            <code>{{ viewportRightEdge }} ≤ {{ viewportLabWidth }}</code>
            <span>{{ viewportFits ? 'Kart ekranın içinde.' : `${viewportOverflow} px ekran dışında.` }}</span>
          </div>
        </article>

        <article class="experiment-card surface-card">
          <div class="experiment-card__head">
            <span>Deney 03</span>
            <strong :class="cardsOverlap ? 'status-error' : 'status-pass'">
              {{ cardsOverlap ? 'Çakışıyor' : 'Geçti' }}
            </strong>
          </div>
          <h3>Kesişim alanı</h3>
          <p>İki bağımsız kartın ortak kapladığı alan sıfır olmalı.</p>
          <div class="mini-controls">
            <label>
              <span>Kartlar arası mesafe <strong>{{ overlapDistance }} px</strong></span>
              <input v-model.number="overlapDistance" type="range" min="0" max="180" data-ui-audit="interactive">
            </label>
          </div>
          <div class="overlap-lab" :class="{ 'is-failing': cardsOverlap }">
            <div class="overlap-card overlap-card--a">A</div>
            <div
              class="overlap-card overlap-card--b"
              :style="{ left: `${10 + (overlapDistance / 180) * 48}%` }"
            >
              B
            </div>
            <span v-if="cardsOverlap" class="overlap-warning">kesişim</span>
          </div>
          <div class="experiment-formula">
            <code>{{ overlapWidth }} × {{ virtualCardHeight }} = {{ overlapArea }} px²</code>
            <span>{{ cardsOverlap ? 'Ortak alan bulundu.' : 'Kartların ortak alanı yok.' }}</span>
          </div>
        </article>

        <article class="experiment-card surface-card">
          <div class="experiment-card__head">
            <span>Deney 04</span>
            <strong :class="touchPasses ? 'status-pass' : 'status-error'">
              {{ touchPasses ? 'Geçti' : 'Çok küçük' }}
            </strong>
          </div>
          <h3>Dokunma hedefi</h3>
          <p>Bir kontrolün iki kenarı da parmakla rahat kullanım için en az 44 px olmalı.</p>
          <div class="mini-controls">
            <label>
              <span>Buton boyutu <strong>{{ touchSize }} × {{ touchSize }} px</strong></span>
              <input v-model.number="touchSize" type="range" min="24" max="64" data-ui-audit="interactive">
            </label>
          </div>
          <div class="touch-lab" :class="{ 'is-failing': !touchPasses }">
            <div class="touch-guide">44 × 44</div>
            <button
              type="button"
              class="touch-demo-button"
              :style="{ width: `${touchSize}px`, height: `${touchSize}px` }"
              aria-label="Örnek favori butonu"
            >
              ♡
            </button>
            <span class="finger-print" aria-hidden="true" />
          </div>
          <div class="experiment-formula">
            <code>{{ touchSize }} ≥ 44</code>
            <span>{{ touchPasses ? 'Rahatça dokunulabilir.' : `${44 - touchSize} px daha büyümeli.` }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="layer-section">
      <div class="page-shell">
        <div class="section-heading section-heading--light">
          <div>
            <p class="eyebrow">Sadece görünüşü test etmiyoruz</p>
            <h2>Dört katmanlı güvenlik ağı.</h2>
          </div>
          <p>
            Tenant tasarımları değişse de veri, kullanıcı davranışı, SSR ve
            geometri ortak sözleşmeler üzerinden doğrulanabilir.
          </p>
        </div>

        <div class="layer-explorer">
          <div class="layer-tabs" role="tablist" aria-label="Test katmanları">
            <button
              v-for="layer in testLayers"
              :key="layer.id"
              type="button"
              role="tab"
              :aria-selected="activeLayerId === layer.id"
              :class="{ 'is-active': activeLayerId === layer.id }"
              data-ui-audit="interactive"
              @click="activeLayerId = layer.id"
            >
              <span>{{ layer.number }}</span>{{ layer.title }}
            </button>
          </div>
          <div class="layer-panel" role="tabpanel" aria-live="polite">
            <div>
              <span class="layer-panel__label">Bu katmanın sorusu</span>
              <h3>{{ activeLayer.question }}</h3>
              <p>{{ activeLayer.explanation }}</p>
              <code>{{ activeLayer.example }}</code>
            </div>
            <div>
              <span class="layer-panel__label">Yakaladığı sorunlar</span>
              <ul>
                <li v-for="item in activeLayer.catches" :key="item"><i>✓</i>{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="scenario-section page-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Senaryo oluşturucu</p>
          <h2>Bir test koşusunu kendin kur.</h2>
        </div>
        <p>
          Bu prototip 30 siteyi çalıştırmak için değil, farklı sitelere
          uygulanabilecek yaklaşımı küçük ölçekte göstermek için tasarlandı.
        </p>
      </div>

      <div class="scenario-builder surface-card">
        <div class="scenario-form">
          <label>
            <span>1. Tenant seç</span>
            <select v-model="scenarioTenantId" data-ui-audit="interactive">
              <option v-for="tenant in scenarioTenants" :key="tenant.id" :value="tenant.id">{{ tenant.name }}</option>
            </select>
          </label>
          <label>
            <span>2. Sayfa seç</span>
            <select v-model="scenarioPageId" data-ui-audit="interactive">
              <option v-for="page in scenarioPages" :key="page.id" :value="page.id">{{ page.name }}</option>
            </select>
          </label>
          <label>
            <span>3. Ekran seç</span>
            <select v-model.number="scenarioViewport" data-ui-audit="interactive">
              <option v-for="viewport in viewports" :key="viewport.width" :value="viewport.width">
                {{ viewport.name }} · {{ viewport.width }} px
              </option>
            </select>
          </label>
          <button type="button" class="scenario-button" data-ui-audit="interactive" @click="scenarioGenerated = true">
            Kontrol planını oluştur <span>→</span>
          </button>
        </div>

        <div class="scenario-output" :class="{ 'is-generated': scenarioGenerated }" aria-live="polite">
          <div class="scenario-preview">
            <span>{{ selectedScenarioTenant.theme }}</span>
            <strong>{{ selectedScenarioTenant.name }}</strong>
            <small>{{ selectedScenarioTenant.modules }} farklı içerik modülü</small>
            <div>
              <i :style="{ width: `${Math.min(100, (scenarioViewport / 1440) * 100 + 22)}%` }" />
              <em>{{ scenarioViewport }} px</em>
            </div>
          </div>
          <div v-if="scenarioGenerated" class="scenario-report">
            <span>Çalıştırılacak kontrol planı</span>
            <h3>{{ selectedScenarioTenant.name }} · {{ selectedScenarioPage.name }}</h3>
            <ul>
              <li v-for="(check, index) in scenarioChecks" :key="check"><i>{{ index + 1 }}</i>{{ check }}</li>
            </ul>
            <p>Bu plan bir başarı sonucu değil; otomasyonun çalıştıracağı kontrollerin açık listesidir.</p>
          </div>
          <div v-else class="scenario-empty">
            <span>＋</span>
            <strong>Seçimlerin hazır</strong>
            <p>Planı görmek için soldaki düğmeye bas.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="decision-section page-shell">
      <div class="decision-card">
        <div>
          <p class="eyebrow">Gerçekçi sınır</p>
          <h2>Ne otomatik, ne manuel kalmalı?</h2>
          <p>
            Kesin ölçülebilen kontrolleri makineye, yoruma dayalı kaliteyi
            insana bırakan dengeli bir yaklaşım kullanıyoruz.
          </p>
          <div class="decision-switch" role="group" aria-label="Değerlendirme türü">
            <button
              type="button"
              :class="{ 'is-active': reviewMode === 'automatic' }"
              data-ui-audit="interactive"
              @click="reviewMode = 'automatic'"
            >
              Otomatik
            </button>
            <button
              type="button"
              :class="{ 'is-active': reviewMode === 'manual' }"
              data-ui-audit="interactive"
              @click="reviewMode = 'manual'"
            >
              Manuel
            </button>
          </div>
        </div>
        <div class="decision-output" aria-live="polite">
          <span>{{ reviewMode === 'automatic' ? 'Makinenin alanı' : 'İnsanın alanı' }}</span>
          <h3>{{ reviewModes[reviewMode].title }}</h3>
          <p>{{ reviewModes[reviewMode].description }}</p>
          <ul>
            <li v-for="item in reviewModes[reviewMode].items" :key="item">
              <i>{{ reviewMode === 'automatic' ? '✓' : '○' }}</i>{{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="rules-section page-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Kalite kuralları</p>
          <h2>Sistem neye bakıyor?</h2>
        </div>
        <p>Dört temel kural, tasarım değişse bile kullanıcı deneyimini korur.</p>
      </div>

      <div class="rules-grid">
        <article v-for="rule in rules" :key="rule.number" :class="`rule-card rule-card--${rule.tone}`">
          <span>{{ rule.number }}</span>
          <h3>{{ rule.title }}</h3>
          <p>{{ rule.explanation }}</p>
          <code>{{ rule.formula }}</code>
        </article>
      </div>
    </section>

    <section class="viewport-section">
      <div class="page-shell viewport-grid">
        <div>
          <p class="eyebrow">Tek tasarım, beş sınav</p>
          <h2>Her ekran ayrı ayrı kontrol edilir.</h2>
          <p>
            Masaüstünde çalışan bir arayüz mobilde bozulabilir. Bu yüzden aynı sayfa
            küçük telefondan geniş masaüstüne kadar yeniden oluşturulup ölçülür.
          </p>
          <NuxtLink :to="{ path: '/', query: route.query }" class="back-to-demo" data-ui-audit="interactive">
            Canlı emlak arayüzüne dön <span>→</span>
          </NuxtLink>
        </div>

        <div class="viewport-list">
          <div v-for="(viewport, index) in viewports" :key="viewport.width">
            <span class="viewport-icon">{{ viewport.icon }}</span>
            <p><strong>{{ viewport.name }}</strong><small>{{ viewport.width }} px genişlik</small></p>
            <span class="viewport-status">Kontrol {{ index + 1 }}/5 <i>✓</i></span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.quality-page { overflow: clip; }
.quality-hero {
  position: relative;
  padding: clamp(72px, 11vw, 140px) 0 90px;
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 20%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 31%),
    linear-gradient(145deg, var(--color-bg), color-mix(in srgb, var(--color-bg) 88%, #050817));
}
.quality-hero__grid {
  position: absolute;
  inset: 0;
  opacity: 0.11;
  background-image:
    linear-gradient(color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, black, transparent 86%);
}
.quality-hero__inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.6fr);
  align-items: end;
  gap: 70px;
}
.quality-hero__inner > * { min-width: 0; }
.quality-hero h1 {
  margin: 0;
  font-size: clamp(3rem, 7vw, 6.7rem);
  letter-spacing: -0.07em;
  line-height: 0.92;
}
.quality-hero h1 span { color: var(--color-accent); }
.quality-hero__inner > div:first-child > p:last-child {
  max-width: 680px;
  margin: 30px 0 0;
  color: var(--color-text-muted);
  font-size: 1.08rem;
  line-height: 1.75;
}
.quality-score {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 22px;
  box-shadow: var(--shadow-md);
}
.score-ring {
  display: grid;
  width: 100px;
  height: 100px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: conic-gradient(var(--color-accent) 0 85%, color-mix(in srgb, var(--color-text) 10%, transparent) 85%);
}
.score-ring > div {
  display: grid;
  width: 76px;
  height: 76px;
  place-items: center;
  align-content: center;
  border-radius: 50%;
  background: var(--color-surface);
}
.score-ring strong { font-size: 1.7rem; line-height: 1; }
.score-ring span { color: var(--color-text-muted); font-size: .64rem; }
.quality-score__label,
.quality-score > div:last-child > strong,
.quality-score small { display: block; }
.quality-score__label {
  margin-bottom: 7px;
  color: var(--color-accent);
  font-size: .67rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.quality-score > div:last-child > strong { line-height: 1.25; }
.quality-score small {
  margin-top: 6px;
  color: var(--color-text-muted);
  line-height: 1.45;
}
.plain-language,
.rules-section { padding-top: 100px; }
.process-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.process-grid article {
  position: relative;
  min-width: 0;
  padding: 25px;
  border: 1px solid color-mix(in srgb, var(--color-text) 9%, transparent);
  border-radius: max(var(--radius), 16px);
  background: var(--color-surface);
}
.process-grid article > span {
  color: var(--color-accent);
  font-size: .7rem;
  font-weight: 900;
}
.process-grid h3 {
  margin: 21px 0 8px;
  font-size: 1.2rem;
}
.process-grid p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: .86rem;
  line-height: 1.6;
}
.process-visual {
  position: relative;
  height: 132px;
  margin-top: 20px;
  overflow: hidden;
  border-radius: 13px;
  background: color-mix(in srgb, var(--color-accent) 7%, var(--color-bg));
}
.process-visual--screens {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 8px;
  padding-bottom: 20px;
}
.process-visual--screens i {
  display: block;
  border: 2px solid var(--color-accent);
  border-radius: 5px;
  opacity: .75;
}
.process-visual--screens i:nth-child(1) { width: 28px; height: 55px; }
.process-visual--screens i:nth-child(2) { width: 52px; height: 76px; }
.process-visual--screens i:nth-child(3) { width: 88px; height: 58px; }
.process-visual--measure {
  display: grid;
  place-items: center;
}
.process-visual--measure::before {
  position: absolute;
  width: 72%;
  border-top: 2px solid var(--color-accent);
  content: "";
}
.process-visual--measure::after {
  position: absolute;
  width: 72%;
  height: 10px;
  border-right: 2px solid var(--color-accent);
  border-left: 2px solid var(--color-accent);
  content: "";
}
.process-visual--measure i {
  z-index: 1;
  padding: 5px 8px;
  background: color-mix(in srgb, var(--color-accent) 9%, var(--color-bg));
  color: var(--color-accent);
  font-size: .72rem;
  font-style: normal;
  font-weight: 850;
}
.process-visual--report {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.process-visual--report i {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  font-style: normal;
  font-weight: 900;
}
.process-visual--report i:last-child { background: #f97316; }
.lab-section {
  margin-top: 100px;
  padding: 100px 0;
  background: color-mix(in srgb, var(--color-primary) 9%, var(--color-bg));
}
.lab-card {
  display: grid;
  grid-template-columns: minmax(260px, .7fr) minmax(0, 1.3fr);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.lab-controls {
  padding: clamp(24px, 5vw, 50px);
  border-right: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
}
.lab-controls label {
  display: block;
  margin-bottom: 30px;
}
.lab-controls label > span {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 11px;
  color: var(--color-text-muted);
  font-size: .78rem;
  font-weight: 750;
}
.lab-controls label strong { color: var(--color-text); }
.lab-controls input[type="text"] {
  width: 100%;
  min-height: 46px;
  padding: 10px 13px;
  border: 1px solid color-mix(in srgb, var(--color-text) 18%, transparent);
  border-radius: 9px;
  background: var(--color-bg);
  color: var(--color-text);
}
.lab-controls input[type="range"] {
  width: 100%;
  min-height: 44px;
  accent-color: var(--color-accent);
}
.formula-box {
  padding: 16px;
  border-radius: 11px;
  background: color-mix(in srgb, var(--color-accent) 8%, var(--color-bg));
}
.formula-box span,
.formula-box code { display: block; }
.formula-box span {
  color: var(--color-text-muted);
  font-size: .67rem;
  font-weight: 800;
  text-transform: uppercase;
}
.formula-box code {
  margin-top: 7px;
  color: var(--color-accent);
  font-size: .92rem;
  font-weight: 800;
}
.lab-stage {
  display: grid;
  min-width: 0;
  place-items: center;
  align-content: center;
  padding: clamp(30px, 6vw, 70px);
  background:
    linear-gradient(color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px);
  background-size: 24px 24px;
}
.ruler {
  display: flex;
  max-width: 100%;
  justify-content: space-between;
  margin-bottom: 8px;
  border-top: 1px solid var(--color-accent);
  color: var(--color-text-muted);
  font-size: .61rem;
}
.ruler span {
  padding-top: 5px;
  transform: translateX(-50%);
}
.ruler span:last-child { transform: translateX(50%); }
.demo-button {
  max-width: 100%;
  min-height: 52px;
  overflow: hidden;
  padding: 12px 18px;
  border: 0;
  border-radius: 12px;
  background: var(--color-accent);
  color: var(--color-secondary);
  font-weight: 850;
  white-space: nowrap;
  transition: box-shadow 160ms ease;
}
.is-error .demo-button {
  box-shadow: 0 0 0 4px rgb(239 68 68 / .25);
  background: #ef4444;
  color: white;
}
.lab-result {
  display: flex;
  width: min(100%, 420px);
  align-items: center;
  gap: 13px;
  margin-top: 32px;
  padding: 14px 16px;
  border: 1px solid rgb(34 197 94 / .3);
  border-radius: 12px;
  background: rgb(34 197 94 / .08);
}
.lab-result > span {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  font-weight: 900;
}
.lab-result strong { font-size: .85rem; }
.lab-result p {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: .72rem;
}
.is-error .lab-result {
  border-color: rgb(239 68 68 / .3);
  background: rgb(239 68 68 / .08);
}
.is-error .lab-result > span { background: #ef4444; }
.experiment-section,
.scenario-section,
.decision-section { padding-top: 100px; }
.experiment-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.experiment-card {
  min-width: 0;
  padding: 25px;
  border: 1px solid color-mix(in srgb, var(--color-text) 9%, transparent);
}
.experiment-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.experiment-card__head > span {
  color: var(--color-accent);
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.experiment-card__head strong {
  padding: 6px 9px;
  border-radius: 999px;
  font-size: .65rem;
}
.status-pass {
  background: rgb(34 197 94 / .12);
  color: #16a34a;
}
.status-error {
  background: rgb(239 68 68 / .12);
  color: #ef4444;
}
.experiment-card h3 {
  margin: 22px 0 7px;
  font-size: 1.35rem;
  letter-spacing: -.03em;
}
.experiment-card > p {
  min-height: 44px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: .8rem;
  line-height: 1.55;
}
.mini-controls {
  display: grid;
  gap: 13px;
  margin: 22px 0;
}
.mini-controls label > span {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--color-text-muted);
  font-size: .68rem;
  font-weight: 750;
}
.mini-controls label strong { color: var(--color-text); }
.mini-controls input {
  width: 100%;
  min-height: 44px;
  margin: 2px 0 0;
  accent-color: var(--color-accent);
}
.viewport-lab,
.overlap-lab,
.touch-lab {
  height: 174px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-text) 9%, transparent);
  border-radius: 14px;
  background:
    linear-gradient(color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px),
    var(--color-bg);
  background-size: 18px 18px;
}
.viewport-lab {
  display: grid;
  place-items: center;
  padding: 18px;
}
.viewport-lab__screen {
  width: 100%;
  height: 118px;
  overflow: hidden;
  border: 2px solid color-mix(in srgb, var(--color-text) 35%, transparent);
  background: var(--color-surface);
}
.viewport-lab__screen > span {
  display: block;
  padding: 7px 9px;
  color: var(--color-text-muted);
  font-size: .58rem;
}
.viewport-lab__card {
  min-width: 0;
  padding: 20px 10px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--color-accent) 19%, var(--color-surface));
  color: var(--color-text);
  font-size: .7rem;
  font-weight: 850;
  white-space: nowrap;
}
.viewport-lab.is-failing .viewport-lab__screen { border-color: #ef4444; }
.viewport-lab.is-failing .viewport-lab__card {
  box-shadow: inset -5px 0 #ef4444;
  background: rgb(239 68 68 / .14);
}
.overlap-lab { position: relative; }
.overlap-card {
  position: absolute;
  top: 40px;
  display: grid;
  width: 38%;
  height: 90px;
  place-items: center;
  border: 2px solid var(--color-accent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-accent) 18%, var(--color-surface));
  color: var(--color-text);
  font-weight: 900;
}
.overlap-card--a { left: 10%; }
.overlap-card--b {
  border-color: #06b6d4;
  background: color-mix(in srgb, #06b6d4 18%, var(--color-surface));
}
.overlap-lab.is-failing .overlap-card { opacity: .78; }
.overlap-warning {
  position: absolute;
  top: 73px;
  left: 50%;
  z-index: 2;
  padding: 5px 7px;
  transform: translateX(-50%);
  border-radius: 5px;
  background: #ef4444;
  color: white;
  font-size: .58rem;
  font-weight: 900;
}
.touch-lab {
  position: relative;
  display: grid;
  place-items: center;
}
.touch-guide {
  position: absolute;
  width: 44px;
  height: 44px;
  border: 1px dashed #22c55e;
  color: transparent;
}
.touch-demo-button {
  z-index: 1;
  display: grid;
  min-width: 0;
  min-height: 0;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: var(--color-accent);
  color: var(--color-secondary);
  font-size: 1.1rem;
}
.touch-lab.is-failing .touch-demo-button {
  outline: 3px solid rgb(239 68 68 / .28);
  background: #ef4444;
  color: white;
}
.finger-print {
  position: absolute;
  width: 48px;
  height: 60px;
  right: 25%;
  bottom: -18px;
  border: 1px solid color-mix(in srgb, var(--color-text) 22%, transparent);
  border-radius: 50% 50% 45% 45%;
  background: color-mix(in srgb, var(--color-text) 7%, var(--color-surface));
  transform: rotate(-14deg);
}
.experiment-formula {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 52px;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--color-accent) 7%, var(--color-bg));
}
.experiment-formula code {
  color: var(--color-accent);
  font-size: .7rem;
  font-weight: 850;
  white-space: nowrap;
}
.experiment-formula span {
  color: var(--color-text-muted);
  font-size: .64rem;
  line-height: 1.35;
  text-align: right;
}
.layer-section {
  margin-top: 100px;
  padding: 100px 0;
  background: #0b1020;
  color: white;
}
.section-heading--light > p { color: rgb(255 255 255 / .6); }
.layer-explorer {
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / .12);
  border-radius: 20px;
  background: rgb(255 255 255 / .045);
}
.layer-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid rgb(255 255 255 / .1);
}
.layer-tabs button {
  display: flex;
  min-width: 0;
  min-height: 72px;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border: 0;
  border-right: 1px solid rgb(255 255 255 / .1);
  background: transparent;
  color: rgb(255 255 255 / .55);
  font-weight: 800;
  text-align: left;
}
.layer-tabs button:last-child { border-right: 0; }
.layer-tabs button span { color: var(--color-accent); font-size: .64rem; }
.layer-tabs button.is-active {
  background: var(--color-accent);
  color: var(--color-secondary);
}
.layer-tabs button.is-active span { color: inherit; }
.layer-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(220px, .6fr);
  gap: clamp(32px, 8vw, 100px);
  min-height: 330px;
  align-items: center;
  padding: clamp(30px, 6vw, 70px);
}
.layer-panel__label {
  color: var(--color-accent);
  font-size: .65rem;
  font-weight: 900;
  letter-spacing: .09em;
  text-transform: uppercase;
}
.layer-panel h3 {
  margin: 12px 0 15px;
  font-size: clamp(2rem, 4vw, 3.6rem);
  letter-spacing: -.055em;
}
.layer-panel p {
  max-width: 650px;
  color: rgb(255 255 255 / .62);
  line-height: 1.65;
}
.layer-panel code {
  display: inline-block;
  max-width: 100%;
  margin-top: 14px;
  padding: 10px 13px;
  overflow-wrap: anywhere;
  border: 1px solid rgb(255 255 255 / .1);
  border-radius: 8px;
  color: var(--color-accent);
  font-size: .72rem;
}
.layer-panel ul,
.scenario-report ul,
.decision-output ul {
  display: grid;
  gap: 10px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}
.layer-panel li,
.scenario-report li,
.decision-output li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: .8rem;
}
.layer-panel li i,
.decision-output li i {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgb(34 197 94 / .16);
  color: #4ade80;
  font-style: normal;
  font-weight: 900;
}
.scenario-builder {
  display: grid;
  grid-template-columns: minmax(260px, .65fr) minmax(0, 1.35fr);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.scenario-form {
  display: grid;
  align-content: center;
  gap: 18px;
  padding: clamp(25px, 5vw, 48px);
  border-right: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
}
.scenario-form label > span {
  display: block;
  margin-bottom: 7px;
  color: var(--color-text-muted);
  font-size: .68rem;
  font-weight: 850;
}
.scenario-form select {
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--color-text) 17%, transparent);
  border-radius: 9px;
  background: var(--color-bg);
  color: var(--color-text);
}
.scenario-button {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 6px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  background: var(--color-accent);
  color: var(--color-secondary);
  font-weight: 900;
}
.scenario-output {
  display: grid;
  grid-template-columns: minmax(180px, .7fr) minmax(230px, 1fr);
  align-items: center;
  gap: clamp(25px, 5vw, 60px);
  min-height: 450px;
  padding: clamp(28px, 6vw, 65px);
  background:
    linear-gradient(color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
}
.scenario-preview {
  min-width: 0;
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}
.scenario-preview > span,
.scenario-report > span,
.decision-output > span {
  color: var(--color-accent);
  font-size: .62rem;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.scenario-preview > strong,
.scenario-preview > small { display: block; }
.scenario-preview > strong { margin-top: 12px; font-size: 1.45rem; }
.scenario-preview > small { margin-top: 4px; color: var(--color-text-muted); }
.scenario-preview > div {
  position: relative;
  height: 115px;
  margin-top: 24px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-text) 14%, transparent);
  background: var(--color-bg);
}
.scenario-preview i {
  display: block;
  height: 100%;
  min-width: 32%;
  border-right: 3px solid var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 13%, var(--color-surface));
}
.scenario-preview em {
  position: absolute;
  right: 8px;
  bottom: 7px;
  color: var(--color-text-muted);
  font-size: .62rem;
  font-style: normal;
}
.scenario-report h3 { margin: 10px 0 18px; font-size: 1.35rem; }
.scenario-report li i {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 7px;
  background: color-mix(in srgb, var(--color-accent) 12%, var(--color-bg));
  color: var(--color-accent);
  font-style: normal;
  font-weight: 900;
}
.scenario-report > p {
  margin: 22px 0 0;
  color: var(--color-text-muted);
  font-size: .7rem;
  line-height: 1.5;
}
.scenario-empty {
  display: grid;
  place-items: start;
  color: var(--color-text-muted);
}
.scenario-empty > span {
  display: grid;
  width: 44px;
  height: 44px;
  margin-bottom: 13px;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--color-text) 30%, transparent);
  border-radius: 50%;
}
.scenario-empty p { margin: 5px 0 0; font-size: .75rem; }
.decision-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border-radius: max(var(--radius), 18px);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-bg));
}
.decision-card > div { padding: clamp(28px, 6vw, 65px); }
.decision-card h2 {
  margin: 0;
  font-size: clamp(2.1rem, 4.5vw, 4rem);
  letter-spacing: -.055em;
  line-height: 1;
}
.decision-card > div:first-child > p:not(.eyebrow) {
  color: var(--color-text-muted);
  line-height: 1.65;
}
.decision-switch {
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 20px;
  padding: 4px;
  border-radius: 11px;
  background: color-mix(in srgb, var(--color-text) 8%, transparent);
}
.decision-switch button {
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 850;
}
.decision-switch button.is-active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 4px 12px rgb(0 0 0 / .08);
}
.decision-output {
  background: var(--color-primary);
  color: white;
}
.decision-output h3 { margin: 12px 0 8px; font-size: 1.75rem; }
.decision-output > p { color: rgb(255 255 255 / .62); line-height: 1.6; }
.decision-output li i { background: rgb(255 255 255 / .1); color: var(--color-accent); }
.rules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
.rule-card {
  position: relative;
  min-width: 0;
  padding: clamp(24px, 4vw, 38px);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-text) 9%, transparent);
  border-radius: max(var(--radius), 16px);
  background: var(--color-surface);
}
.rule-card > span {
  color: var(--rule-color);
  font-size: .72rem;
  font-weight: 900;
}
.rule-card h3 {
  margin: 42px 0 10px;
  font-size: clamp(1.25rem, 3vw, 1.8rem);
  letter-spacing: -.035em;
}
.rule-card p {
  max-width: 510px;
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.65;
}
.rule-card code {
  display: inline-flex;
  margin-top: 24px;
  padding: 8px 11px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rule-color) 9%, transparent);
  color: var(--rule-color);
  font-size: .74rem;
  font-weight: 750;
}
.rule-card::after {
  position: absolute;
  width: 150px;
  height: 150px;
  top: -90px;
  right: -60px;
  border-radius: 50%;
  background: var(--rule-color);
  filter: blur(50px);
  opacity: .16;
  content: "";
}
.rule-card--violet { --rule-color: #8b5cf6; }
.rule-card--cyan { --rule-color: #06b6d4; }
.rule-card--lime { --rule-color: #22c55e; }
.rule-card--orange { --rule-color: #f97316; }
.viewport-section {
  margin-top: 100px;
  padding: clamp(70px, 10vw, 120px) 0;
  background: var(--color-primary);
  color: white;
}
.viewport-grid {
  display: grid;
  grid-template-columns: .9fr 1.1fr;
  align-items: center;
  gap: clamp(50px, 10vw, 130px);
}
.viewport-grid h2 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4.7rem);
  letter-spacing: -.06em;
  line-height: .98;
}
.viewport-grid > div:first-child > p:not(.eyebrow) {
  max-width: 540px;
  margin: 24px 0;
  color: rgb(255 255 255 / .67);
  line-height: 1.7;
}
.back-to-demo {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  min-height: 48px;
  color: white;
  font-weight: 800;
  text-decoration: none;
}
.back-to-demo span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-secondary);
}
.viewport-list {
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / .14);
  border-radius: 18px;
  background: rgb(255 255 255 / .06);
  backdrop-filter: blur(12px);
}
.viewport-list > div {
  display: grid;
  grid-template-columns: 45px 1fr auto;
  align-items: center;
  gap: 13px;
  min-width: 0;
  padding: 15px 18px;
  border-bottom: 1px solid rgb(255 255 255 / .1);
}
.viewport-list > div:last-child { border-bottom: 0; }
.viewport-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 10px;
  background: rgb(255 255 255 / .09);
  color: var(--color-accent);
  font-size: 1.35rem;
}
.viewport-list p { min-width: 0; margin: 0; }
.viewport-list strong,
.viewport-list small { display: block; }
.viewport-list strong { font-size: .86rem; }
.viewport-list small {
  margin-top: 3px;
  color: rgb(255 255 255 / .55);
  font-size: .68rem;
}
.viewport-status {
  color: rgb(255 255 255 / .5);
  font-size: .68rem;
  white-space: nowrap;
}
.viewport-status i {
  display: inline-grid;
  width: 22px;
  height: 22px;
  margin-left: 8px;
  place-items: center;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  font-style: normal;
  font-weight: 900;
}

@media (max-width: 900px) {
  .quality-hero__inner,
  .viewport-grid,
  .scenario-builder,
  .decision-card { grid-template-columns: 1fr; }
  .quality-score { max-width: 520px; }
  .lab-card { grid-template-columns: 1fr; }
  .lab-controls {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  }
  .experiment-grid { grid-template-columns: 1fr; }
  .experiment-card > p { min-height: 0; }
  .scenario-form {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  }
}

@media (max-width: 720px) {
  .process-grid,
  .rules-grid { grid-template-columns: 1fr; }
  .process-grid article { display: grid; grid-template-columns: 1fr; }
  .layer-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .layer-tabs button:nth-child(2) { border-right: 0; }
  .layer-tabs button:nth-child(-n+2) { border-bottom: 1px solid rgb(255 255 255 / .1); }
  .layer-panel,
  .scenario-output { grid-template-columns: 1fr; }
  .layer-panel { min-height: 0; }
  .scenario-output { min-height: 0; }
}

@media (max-width: 430px) {
  .quality-hero h1 { font-size: 2.5rem; }
  .quality-score { display: block; }
  .score-ring { margin-bottom: 20px; }
  .lab-stage { padding-inline: 20px; }
  .viewport-list > div {
    grid-template-columns: 40px 1fr;
  }
  .viewport-status {
    grid-column: 2;
  }
  .layer-tabs { grid-template-columns: 1fr; }
  .layer-tabs button {
    min-height: 56px;
    border-right: 0;
    border-bottom: 1px solid rgb(255 255 255 / .1);
  }
  .layer-tabs button:last-child { border-bottom: 0; }
  .experiment-formula {
    align-items: flex-start;
    flex-direction: column;
  }
  .experiment-formula span { text-align: left; }
  .scenario-preview { padding: 18px; }
}
</style>
