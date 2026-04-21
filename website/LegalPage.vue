<template>
  <div class="legal-app">
    <div class="legal-bg" aria-hidden="true">
      <span class="legal-orb legal-orb--blue"></span>
      <span class="legal-orb legal-orb--violet"></span>
      <span class="legal-grid"></span>
    </div>

    <header class="legal-header">
      <div class="legal-header__inner">
        <NuxtLink to="/" class="legal-brand" aria-label="AuroraPad home">
          <img class="legal-brand__icon" :src="appIcon" alt="" />
          <span class="legal-brand__copy">
            <strong>AuroraPad</strong>
            <small>{{ page.kicker }}</small>
          </span>
        </NuxtLink>

        <div class="legal-header__actions">
          <NuxtLink to="/" @click="handleNavClick('home', '/')">Home</NuxtLink>
          <a :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_legal_header', downloadUrl, 'legal-header')">Releases</a>
        </div>
      </div>
    </header>

    <main>
      <section class="legal-hero">
        <div class="legal-shell">
          <p class="legal-eyebrow">{{ page.kicker }}</p>
          <h1>{{ page.title }}</h1>
          <p class="legal-summary">{{ page.summary }}</p>

          <div class="legal-meta">
            <div class="legal-meta__item">
              <span>Applies to</span>
              <strong>{{ page.appliesTo }}</strong>
            </div>
            <div class="legal-meta__item">
              <span>Last updated</span>
              <strong>{{ page.updatedAt }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="legal-content">
        <div class="legal-shell legal-shell--narrow">
          <article v-for="section in page.sections" :key="section.title" class="legal-section">
            <h2>{{ section.title }}</h2>
            <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          </article>

          <div class="legal-links">
            <NuxtLink to="/terms" @click="handleNavClick('terms', '/terms')">Terms</NuxtLink>
            <NuxtLink to="/privacy" @click="handleNavClick('privacy', '/privacy')">Privacy</NuxtLink>
            <NuxtLink to="/usage" @click="handleNavClick('usage', '/usage')">Usage</NuxtLink>
            <NuxtLink to="/license" @click="handleNavClick('license', '/license')">License</NuxtLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import appIcon from '../assets/aurorapad-app-icon.png'
const { trackNavigation, trackOutboundLink } = useSiteAnalytics()

defineProps({
  page: {
    type: Object,
    required: true,
  },
  downloadUrl: {
    type: String,
    required: true,
  },
})

function handleNavClick(label, target) {
  trackNavigation(`legal_${label}`, target, 'legal-page')
}

function handleOutboundClick(label, destination, placement) {
  trackOutboundLink(label, destination, placement)
}
</script>

<style scoped>
.legal-app {
  color: #eef5ff;
  background:
    radial-gradient(circle at 14% 16%, rgba(15, 99, 233, 0.2), transparent 22%),
    radial-gradient(circle at 82% 14%, rgba(122, 56, 235, 0.2), transparent 24%),
    #07101d;
}

.legal-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.legal-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(66px);
}

.legal-orb--blue {
  width: 360px;
  height: 360px;
  top: -100px;
  left: -60px;
  background: rgba(15, 99, 233, 0.34);
}

.legal-orb--violet {
  width: 320px;
  height: 320px;
  top: 20px;
  right: -80px;
  background: rgba(122, 56, 235, 0.28);
}

.legal-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 84%);
}

.legal-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 16px 20px 0;
}

.legal-header__inner,
.legal-shell {
  max-width: 1200px;
  margin: 0 auto;
}

.legal-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid rgba(171, 196, 255, 0.14);
  border-radius: 22px;
  background: rgba(7, 15, 30, 0.68);
  backdrop-filter: blur(22px) saturate(140%);
}

.legal-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.legal-brand__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.legal-brand__copy {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.legal-brand__copy strong {
  font-size: 15px;
}

.legal-brand__copy small,
.legal-meta__item span,
.legal-eyebrow {
  color: #93dfff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.legal-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.legal-header__actions a,
.legal-links a {
  color: rgba(227, 237, 255, 0.82);
  text-decoration: none;
}

.legal-header__actions a:hover,
.legal-links a:hover {
  color: #fff;
}

.legal-hero {
  padding: 48px 20px 24px;
}

.legal-shell--narrow {
  max-width: 860px;
}

.legal-shell h1 {
  margin: 0;
  font-family: 'Space Grotesk', 'Avenir Next', sans-serif;
  font-size: clamp(2.8rem, 6vw, 4.8rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.legal-summary {
  max-width: 60ch;
  margin: 18px 0 0;
  color: rgba(221, 232, 250, 0.8);
  line-height: 1.8;
  font-size: 1.02rem;
}

.legal-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.legal-meta__item {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(168, 194, 255, 0.14);
  background: rgba(11, 20, 39, 0.52);
}

.legal-meta__item strong {
  display: block;
  margin-top: 8px;
  font-size: 14px;
}

.legal-content {
  padding: 12px 20px 84px;
}

.legal-section {
  padding: 26px 0;
  border-top: 1px solid rgba(173, 198, 255, 0.12);
}

.legal-section:first-child {
  border-top: none;
  padding-top: 0;
}

.legal-section h2 {
  margin: 0 0 16px;
  font-size: 1.45rem;
  line-height: 1.2;
}

.legal-section p {
  margin: 0 0 14px;
  color: rgba(207, 219, 243, 0.78);
  line-height: 1.82;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px solid rgba(173, 198, 255, 0.12);
}

@media (max-width: 760px) {
  .legal-header {
    padding: 14px 14px 0;
  }

  .legal-hero,
  .legal-content {
    padding-left: 14px;
    padding-right: 14px;
  }

  .legal-header__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .legal-meta {
    grid-template-columns: 1fr;
  }
}
</style>
