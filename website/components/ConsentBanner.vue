<template>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="bannerOpen" class="consent-banner" role="dialog" aria-labelledby="consent-title" aria-modal="false">
        <div class="consent-banner__inner">
          <div class="consent-banner__copy">
            <p class="consent-banner__eyebrow">{{ bannerEyebrow }}</p>
            <h2 id="consent-title">{{ bannerTitle }}</h2>
            <p>{{ bannerBody }}</p>
            <p class="consent-banner__note">
              Google Search Console verification is treated as technical site verification, not advertising or behavioral profiling.
            </p>
          </div>

          <div class="consent-banner__actions">
            <button class="consent-btn consent-btn--ghost" type="button" @click="openSettings">
              Customize
            </button>
            <button class="consent-btn consent-btn--outline" type="button" @click="rejectOptional">
              {{ rejectLabel }}
            </button>
            <button class="consent-btn consent-btn--primary" type="button" @click="acceptOptional">
              {{ acceptLabel }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="settingsOpen" class="consent-modal" role="dialog" aria-labelledby="consent-settings-title" aria-modal="true">
        <div class="consent-modal__backdrop" @click="closeSettings"></div>
        <div class="consent-modal__panel">
          <div class="consent-modal__head">
            <div>
              <p class="consent-banner__eyebrow">Privacy controls</p>
              <h2 id="consent-settings-title">Choose how AuroraPad website uses Google services</h2>
            </div>
            <button class="consent-modal__close" type="button" aria-label="Close cookie settings" @click="closeSettings">
              ×
            </button>
          </div>

          <div class="consent-modal__body">
            <label class="consent-toggle">
              <span>
                <strong>Essential website functions</strong>
                <small>Required for core site delivery, security, and remembering your privacy choice.</small>
              </span>
              <span class="consent-toggle__fixed">Always on</span>
            </label>

            <label class="consent-toggle">
              <span>
                <strong>Google Analytics and tag management</strong>
                <small>
                  Allows optional measurement, campaign tags, and future Google Tag Manager containers to load after consent.
                </small>
              </span>
              <input v-model="draftAnalytics" type="checkbox" />
            </label>

            <div class="consent-modal__helper">
              <p>
                {{ regionHelper }}
              </p>
              <p>
                Search Console verification can stay active without using advertising cookies or cross-site tracking.
              </p>
            </div>
          </div>

          <div class="consent-modal__actions">
            <button class="consent-btn consent-btn--ghost" type="button" @click="rejectOptional">
              Essential only
            </button>
            <button class="consent-btn consent-btn--primary" type="button" @click="saveSettings">
              Save choices
            </button>
          </div>
        </div>
      </div>

      <button
        v-if="showPreferencesButton"
        class="consent-preferences"
        type="button"
        @click="openSettings"
      >
        Privacy settings
      </button>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'aurorapad-consent-v1'
const POLICY_VERSION = 1

const EU_REGION_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE', 'IS', 'LI', 'NO', 'GB', 'UK', 'CH',
])

const EU_TIMEZONE_PREFIXES = [
  'Europe/',
  'Atlantic/Canary',
  'Atlantic/Madeira',
]

type ConsentState = {
  policyVersion: number
  region: 'eu' | 'other'
  analytics: boolean
  decidedAt: string | null
}

const config = useRuntimeConfig()

const defaultConsent = (): ConsentState => ({
  policyVersion: POLICY_VERSION,
  region: 'other',
  analytics: false,
  decidedAt: null,
})

const consent = ref<ConsentState>(defaultConsent())
const bannerOpen = ref(false)
const settingsOpen = ref(false)
const draftAnalytics = ref(false)
const hydrated = ref(false)

const analyticsId = computed(() => config.public.googleAnalyticsId || '')
const tagManagerId = computed(() => config.public.googleTagManagerId || '')
const hasTrackingIntegration = computed(() => Boolean(analyticsId.value || tagManagerId.value))
const isEuStyleRegion = computed(() => consent.value.region === 'eu')
const trackingEnabled = computed(() => hydrated.value && consent.value.analytics && hasTrackingIntegration.value)
const showPreferencesButton = computed(() => hydrated.value && hasTrackingIntegration.value)

const bannerEyebrow = computed(() =>
  isEuStyleRegion.value ? 'Consent required in your region' : 'Privacy choices'
)

const bannerTitle = computed(() =>
  isEuStyleRegion.value
    ? 'Allow optional Google analytics for AuroraPad website?'
    : 'Help improve AuroraPad website with optional Google analytics'
)

const bannerBody = computed(() =>
  isEuStyleRegion.value
    ? 'We only enable Google Analytics or future Google Tag Manager tracking after you opt in. You can continue with essential site functions only.'
    : 'You can allow optional Google Analytics and future Google Tag Manager-based measurement, or continue with essential website functions only.'
)

const regionHelper = computed(() =>
  isEuStyleRegion.value
    ? 'Visitors in the EU, EEA, UK, and Switzerland are treated with explicit opt-in defaults for optional measurement.'
    : 'Outside stricter consent regions, you still keep full control and can opt out of optional measurement at any time.'
)

const acceptLabel = computed(() =>
  isEuStyleRegion.value ? 'Accept optional analytics' : 'Allow analytics'
)

const rejectLabel = computed(() =>
  isEuStyleRegion.value ? 'Reject optional tracking' : 'Essential only'
)

const siteScripts = computed(() => {
  const scripts: Array<Record<string, unknown>> = []

  if (trackingEnabled.value && analyticsId.value) {
    scripts.push({
      key: 'ga-loader',
      src: `https://www.googletagmanager.com/gtag/js?id=${analyticsId.value}`,
      async: true,
    })
    scripts.push({
      key: 'ga-inline',
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = window.gtag || gtag;
        gtag('js', new Date());
        gtag('consent', 'default', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
        gtag('config', '${analyticsId.value}', { anonymize_ip: true });
      `,
    })
  }

  if (trackingEnabled.value && tagManagerId.value) {
    scripts.push({
      key: 'gtm-inline',
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'aurorapad_consent_granted' });
        (function(w,d,s,l,i){
          w[l]=w[l]||[];
          w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),
            dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;
          j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${tagManagerId.value}');
      `,
    })
  }

  return scripts
})

useHead(() => ({
  script: siteScripts.value,
}))

function inferRegion(): 'eu' | 'other' {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  if (EU_TIMEZONE_PREFIXES.some((prefix) => timezone.startsWith(prefix))) {
    return 'eu'
  }

  const languages = Array.from(new Set([navigator.language, ...(navigator.languages || [])].filter(Boolean)))
  for (const locale of languages) {
    const match = locale.match(/-([A-Za-z]{2})$/)
    if (match && EU_REGION_CODES.has(match[1].toUpperCase())) {
      return 'eu'
    }
  }

  return 'other'
}

function persistConsent(nextState: ConsentState) {
  consent.value = nextState
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  bannerOpen.value = false
  settingsOpen.value = false
  draftAnalytics.value = nextState.analytics
}

function acceptOptional() {
  persistConsent({
    ...consent.value,
    policyVersion: POLICY_VERSION,
    analytics: true,
    decidedAt: new Date().toISOString(),
  })
}

function rejectOptional() {
  persistConsent({
    ...consent.value,
    policyVersion: POLICY_VERSION,
    analytics: false,
    decidedAt: new Date().toISOString(),
  })
}

function saveSettings() {
  persistConsent({
    ...consent.value,
    policyVersion: POLICY_VERSION,
    analytics: draftAnalytics.value,
    decidedAt: new Date().toISOString(),
  })
}

function openSettings() {
  draftAnalytics.value = consent.value.analytics
  settingsOpen.value = true
}

function closeSettings() {
  settingsOpen.value = false
}

onMounted(() => {
  hydrated.value = true

  if (!hasTrackingIntegration.value) {
    return
  }

  const region = inferRegion()
  const saved = localStorage.getItem(STORAGE_KEY)

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Partial<ConsentState>
      consent.value = {
        policyVersion: parsed.policyVersion === POLICY_VERSION ? POLICY_VERSION : POLICY_VERSION,
        region: parsed.region === 'eu' || parsed.region === 'other' ? parsed.region : region,
        analytics: Boolean(parsed.analytics),
        decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : null,
      }
      draftAnalytics.value = consent.value.analytics
      if (parsed.policyVersion !== POLICY_VERSION) {
        bannerOpen.value = true
      }
      return
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  consent.value = {
    ...defaultConsent(),
    region,
  }
  draftAnalytics.value = false
  bannerOpen.value = true
})
</script>

<style scoped>
.consent-banner {
  position: fixed;
  inset: auto 1rem 1rem 1rem;
  z-index: 80;
}

.consent-banner__inner,
.consent-modal__panel {
  border: 1px solid rgba(127, 154, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(10, 18, 30, 0.96), rgba(6, 11, 22, 0.98));
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.38);
  color: rgba(236, 242, 255, 0.94);
}

.consent-banner__inner {
  display: grid;
  gap: 1rem;
  max-width: 76rem;
  margin: 0 auto;
  padding: 1.1rem;
  border-radius: 1.5rem;
  backdrop-filter: blur(20px);
}

.consent-banner__copy h2,
.consent-modal__head h2 {
  margin: 0;
  font-size: clamp(1.05rem, 1.8vw, 1.45rem);
  line-height: 1.15;
}

.consent-banner__copy p,
.consent-modal__helper p {
  margin: 0;
  color: rgba(213, 223, 248, 0.76);
}

.consent-banner__note {
  font-size: 0.92rem;
}

.consent-banner__eyebrow {
  margin: 0 0 0.45rem;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8fb7ff;
}

.consent-banner__actions,
.consent-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.consent-btn {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1.15rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.consent-btn:hover,
.consent-modal__close:hover,
.consent-preferences:hover {
  transform: translateY(-1px);
}

.consent-btn--primary {
  background: linear-gradient(135deg, #67a8ff, #7b7dff 56%, #70e0db);
  color: #06101b;
}

.consent-btn--outline,
.consent-btn--ghost,
.consent-modal__close,
.consent-preferences {
  border: 1px solid rgba(127, 154, 255, 0.22);
  background: rgba(10, 18, 30, 0.64);
  color: rgba(236, 242, 255, 0.94);
}

.consent-modal {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.consent-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 8, 16, 0.64);
  backdrop-filter: blur(10px);
}

.consent-modal__panel {
  position: relative;
  width: min(100%, 42rem);
  padding: 1.2rem;
  border-radius: 1.6rem;
}

.consent-modal__head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.consent-modal__close {
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 999px;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.consent-modal__body {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.consent-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(127, 154, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
}

.consent-toggle strong,
.consent-toggle small {
  display: block;
}

.consent-toggle small,
.consent-toggle__fixed {
  color: rgba(213, 223, 248, 0.7);
}

.consent-toggle input {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #7aa0ff;
}

.consent-modal__helper {
  display: grid;
  gap: 0.55rem;
  padding: 0.3rem 0.1rem 0;
}

.consent-preferences {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 70;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  backdrop-filter: blur(14px);
}

@media (min-width: 920px) {
  .consent-banner__inner {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .consent-banner__actions {
    justify-content: end;
  }
}

@media (max-width: 700px) {
  .consent-banner,
  .consent-preferences {
    inset-inline: 0.75rem;
  }

  .consent-preferences {
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .consent-btn,
  .consent-banner__actions .consent-btn,
  .consent-modal__actions .consent-btn {
    width: 100%;
  }
}
</style>
