<template>
  <div class="aurora-site">
    <div class="site-bg" aria-hidden="true">
      <span ref="orbBlue" class="orb orb-blue"></span>
      <span ref="orbTeal" class="orb orb-teal"></span>
      <span ref="orbViolet" class="orb orb-violet"></span>
      <span class="mesh"></span>
    </div>

    <header class="site-header">
      <div class="site-header__inner">
        <a href="#top" class="brand" aria-label="AuroraPad home">
          <img class="brand__icon" :src="appIcon" alt="" />
          <span class="brand__copy">
            <strong>AuroraPad</strong>
            <small>Desktop editor</small>
          </span>
        </a>

        <nav class="site-nav site-nav--desktop" aria-label="Primary">
          <a href="#why" @click="handleSectionNavigation('why', 'header-nav')">Why</a>
          <a href="#workspace" @click="handleSectionNavigation('workspace', 'header-nav')">Workspace</a>
          <a href="#showcase" @click="handleSectionNavigation('showcase', 'header-nav')">Showcase</a>
          <a href="#releases" @click="handleSectionNavigation('releases', 'header-nav')">Releases</a>
          <a href="#faq" @click="handleSectionNavigation('faq', 'header-nav')">FAQ</a>
        </nav>

        <div class="site-header__actions">
          <a class="site-btn site-btn--primary" :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_header', downloadUrl, 'header')">Download</a>
        </div>
      </div>
    </header>

    <main>
      <section id="top" class="hero">
        <div class="hero__inner">
          <div class="hero__copy">
            <p class="eyebrow">Modern desktop editing for real project work</p>
            <h1>One focused editor for code, search, terminal flow, and release-ready shipping.</h1>
            <p class="hero__body">
              AuroraPad brings Monaco editing, project navigation, built-in skills, integrated terminal
              sessions, and packaged cross-platform releases into a faster, cleaner desktop experience.
            </p>

            <div class="hero__actions">
              <a class="site-btn site-btn--primary site-btn--large" :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_hero', downloadUrl, 'hero')">
                Download Latest Release
              </a>
            </div>

            <div class="hero__meta">
              <div v-for="item in heroMeta" :key="item.label" class="hero__meta-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </div>

          <div class="hero__visual">
            <div ref="heroWindow" class="product-window">
              <div class="product-window__top">
                <div class="traffic">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="product-window__title">AuroraPad Workspace</div>
                <div class="product-window__badge">v0.1.x builds</div>
              </div>

              <div class="product-window__body">
                <aside class="workspace-sidebar">
                  <div class="workspace-sidebar__section">
                    <span class="workspace-label">Project</span>
                    <span>src/</span>
                    <span>components/</span>
                    <span>plugins/</span>
                    <span>website/</span>
                  </div>
                  <div class="workspace-sidebar__section">
                    <span class="workspace-label">Recent</span>
                    <span>App.vue</span>
                    <span>TerminalDock.vue</span>
                    <span>release.yml</span>
                  </div>
                </aside>

                <div class="workspace-editor">
                  <div class="workspace-tabs">
                    <span class="is-active">release.yml</span>
                    <span>settings.js</span>
                    <span>WebsiteApp.vue</span>
                  </div>

                  <div class="workspace-code">
                    <div v-for="line in editorLines" :key="line" class="workspace-code__line">{{ line }}</div>
                  </div>

                  <div class="workspace-terminal">
                    <div class="workspace-terminal__head">
                      <span>Integrated Terminal</span>
                      <span>zsh • project root</span>
                    </div>
                    <div class="workspace-terminal__body">
                      <span>$ npm run build</span>
                      <span>✓ app ready</span>
                      <span>✓ website ready</span>
                      <span>✓ release assets packaged</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div ref="floatLeft" class="floating-note floating-note--left">
              <span class="eyebrow">Search</span>
              <strong>Whole-project search, not file-only editing</strong>
            </div>

            <div ref="floatRight" class="floating-note floating-note--right">
              <span class="eyebrow">Release</span>
              <strong>Ship tagged builds for Windows, macOS, and Linux</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="proof-strip" aria-label="Product proof">
        <div class="proof-strip__inner">
          <span v-for="item in proofItems" :key="item">{{ item }}</span>
        </div>
      </section>

      <section id="why" class="section section--editorial">
        <div class="section-head" data-reveal="up">
          <p class="eyebrow">Why AuroraPad</p>
          <h2>Built for developers who want a sharper desktop editor without losing project depth.</h2>
        </div>

        <div class="editorial-columns">
          <article
            v-for="(item, i) in pillars"
            :key="item.title"
            class="editorial-column"
            data-reveal="up"
            :data-reveal-delay="i * 130"
          >
            <span class="eyebrow">{{ item.kicker }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </section>

      <section id="workspace" class="section workspace-story">
        <div class="workspace-story__grid">
          <div class="workspace-story__intro" data-reveal="left">
            <p class="eyebrow">Workspace</p>
            <h2>Editing, navigation, terminal context, and commands in one calm desktop surface.</h2>
            <p>
              AuroraPad is shaped around the real loop of opening a repo, moving through files,
              searching across the project, making changes, and running commands without breaking flow.
            </p>
          </div>

          <div class="workspace-story__list">
            <article
              v-for="(feature, i) in features"
              :key="feature.title"
              class="feature-row"
              :data-reveal="i % 2 === 0 ? 'left' : 'right'"
              :data-reveal-delay="i * 100"
            >
              <div class="feature-row__index">{{ feature.index }}</div>
              <div>
                <span class="eyebrow">{{ feature.kicker }}</span>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.body }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="showcase" class="section showcase">
        <div class="section-head" data-reveal="up">
          <p class="eyebrow">Showcase</p>
          <h2>A closer look at the moments that make AuroraPad feel like a modern desktop tool.</h2>
        </div>

        <div class="showcase-grid">
          <article
            v-for="(item, i) in showcaseCards"
            :key="item.title"
            class="showcase-card"
            :class="item.className"
            data-reveal="zoom"
            :data-reveal-delay="i * 120"
          >
            <div class="showcase-card__visual">
              <div class="showcase-mockup">
                <div class="showcase-mockup__bar">
                  <span>{{ item.mockupTitle }}</span>
                  <small>{{ item.mockupMeta }}</small>
                </div>
                <div class="showcase-mockup__body">
                  <span v-for="line in item.lines" :key="line">{{ line }}</span>
                </div>
              </div>
            </div>
            <div class="showcase-card__copy">
              <span class="eyebrow">{{ item.kicker }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="section manifesto">
        <div class="manifesto-card" data-reveal="zoom">
          <div>
            <p class="eyebrow">What Makes It Different</p>
            <h2>More grounded than a generic editor shell, lighter than a full IDE, and packaged like a real product.</h2>
          </div>
          <div class="manifesto-points">
            <div v-for="point in manifestoPoints" :key="point.title" class="manifesto-point">
              <strong>{{ point.title }}</strong>
              <p>{{ point.body }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section compare-section">
        <div class="section-head" data-reveal="up">
          <p class="eyebrow">Positioning</p>
          <h2>Made for the space between a bare text editor and a full-blown IDE.</h2>
        </div>

        <div class="compare-grid">
          <article
            v-for="(item, i) in comparisonItems"
            :key="item.title"
            class="compare-card"
            data-reveal="up"
            :data-reveal-delay="i * 130"
          >
            <span class="eyebrow">{{ item.kicker }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </section>

      <section id="releases" class="section release-section">
        <div class="section-head" data-reveal="up">
          <p class="eyebrow">Releases</p>
          <h2>Clear download paths and release automation that match the product.</h2>
        </div>

        <div class="release-grid">
          <div class="download-matrix">
            <a
              v-for="(item, i) in downloads"
              :key="item.title"
              class="download-item"
              :href="downloadUrl"
              target="_blank"
              rel="noreferrer"
              data-reveal="up"
              :data-reveal-delay="i * 110"
              @click="handleOutboundClick(`download_${item.kicker.toLowerCase()}`, downloadUrl, 'download-matrix')"
            >
              <span class="eyebrow">{{ item.kicker }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.body }}</p>
            </a>
          </div>

          <div class="release-aside" data-reveal="right">
            <div class="release-link-group">
              <span class="eyebrow">Latest Builds</span>
              <a :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_release_section', downloadUrl, 'release-section')">{{ downloadUrl }}</a>
            </div>
            <div class="release-callout">
              AuroraPad publishes packaged binaries first. GitHub's auto-generated source archives still exist,
              but the intended experience is to download the platform-specific desktop builds.
            </div>
          </div>
        </div>

        <div class="artifact-matrix" data-reveal="up">
          <div class="artifact-matrix__head">
            <span>Platform</span>
            <span>Primary assets</span>
            <span>Best for</span>
          </div>
          <div v-for="row in artifactRows" :key="row.platform" class="artifact-matrix__row">
            <strong>{{ row.platform }}</strong>
            <span>{{ row.assets }}</span>
            <span>{{ row.useCase }}</span>
          </div>
        </div>

        <div class="release-flow" data-reveal="up">
          <div class="release-flow__intro">
            <p class="eyebrow">Release Flow</p>
            <h3>From commit to tagged desktop binaries.</h3>
          </div>
          <div class="release-flow__steps">
            <article
              v-for="(step, i) in releaseSteps"
              :key="step.title"
              class="release-step"
              data-reveal="left"
              :data-reveal-delay="i * 120"
            >
              <span class="release-step__index">{{ step.index }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <p>{{ step.body }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section open-source">
        <div class="open-source__grid">
          <div class="section-head section-head--compact" data-reveal="left">
            <p class="eyebrow">Project System</p>
            <h2>The editor, release flow, and product website are built as one connected system.</h2>
          </div>

          <div class="open-source__items">
            <article
              v-for="(item, i) in projectItems"
              :key="item.title"
              class="open-source__item"
              data-reveal="right"
              :data-reveal-delay="i * 110"
            >
              <span class="eyebrow">{{ item.kicker }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" class="section faq">
        <div class="section-head" data-reveal="up">
          <p class="eyebrow">FAQ</p>
          <h2>Questions people usually ask before trying a new editor.</h2>
        </div>

        <div class="faq-list">
          <article
            v-for="(item, i) in faqItems"
            :key="item.q"
            class="faq-item"
            data-reveal="up"
            :data-reveal-delay="i * 120"
          >
            <h3>{{ item.q }}</h3>
            <p>{{ item.a }}</p>
          </article>
        </div>
      </section>

      <section class="section final-cta">
        <div class="final-cta__shell" data-reveal="zoom">
          <p class="eyebrow">Try AuroraPad</p>
          <h2>Download the latest build and shape the editor around your own workflow.</h2>
          <div class="final-cta__options">
            <div v-for="item in finalOptions" :key="item.title" class="final-cta__option">
              <strong>{{ item.title }}</strong>
              <span>{{ item.body }}</span>
            </div>
          </div>
          <div class="hero__actions">
            <a class="site-btn site-btn--primary site-btn--large" :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_final_cta', downloadUrl, 'final-cta')">
              Download AuroraPad
            </a>
          </div>
        </div>
      </section>

      <footer class="site-footer">
        <div class="site-footer__inner">
          <div>
            <strong>AuroraPad</strong>
            <p>Cross-platform desktop editing with real project awareness.</p>
          </div>
          <div class="site-footer__links">
            <a :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_footer', downloadUrl, 'footer')">Releases</a>
            <a href="#workspace" @click="handleSectionNavigation('workspace', 'footer')">Workspace</a>
            <a href="#faq" @click="handleSectionNavigation('faq', 'footer')">FAQ</a>
            <NuxtLink to="/terms" @click="handleLegalNavigation('terms', 'footer')">Terms</NuxtLink>
            <NuxtLink to="/privacy" @click="handleLegalNavigation('privacy', 'footer')">Privacy</NuxtLink>
            <NuxtLink to="/usage" @click="handleLegalNavigation('usage', 'footer')">Usage</NuxtLink>
            <NuxtLink to="/license" @click="handleLegalNavigation('license', 'footer')">License</NuxtLink>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import appIcon from '../assets/aurorapad-app-icon.png'
import { downloadUrl } from './data/site'
const { trackNavigation, trackOutboundLink } = useSiteAnalytics()

function handleOutboundClick(label, destination, placement) {
  trackOutboundLink(label, destination, placement)
}
function handleSectionNavigation(section, placement) {
  trackNavigation(`section_${section}`, `#${section}`, placement)
}
function handleLegalNavigation(page, placement) {
  trackNavigation(`legal_${page}`, `/${page}`, placement)
}

// ── Parallax refs ──────────────────────────────────────────────────────────
const heroWindow = ref(null)
const orbBlue    = ref(null)
const orbTeal    = ref(null)
const orbViolet  = ref(null)
const floatLeft  = ref(null)
const floatRight = ref(null)

// ── Scroll reveal via IntersectionObserver ─────────────────────────────────
function setupScrollReveal() {
  if (typeof window === 'undefined') return null

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'))
    return null
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el    = entry.target
        const delay = parseInt(el.dataset.revealDelay || '0', 10)

        el.style.transitionDelay = `${delay}ms`
        // rAF ensures layout is stable before class toggle
        requestAnimationFrame(() => el.classList.add('is-revealed'))

        // Clear delay so subsequent transitions (hover, etc.) are instant
        setTimeout(() => { el.style.transitionDelay = '0ms' }, delay + 900)

        observer.unobserve(el)
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
  )

  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
  return observer
}

// ── Parallax scroll ────────────────────────────────────────────────────────
let ticking = false
let heroAnimDone = false

function updateParallax() {
  const y = window.scrollY

  // Orbs drift at independent speeds
  if (orbBlue.value)   orbBlue.value.style.transform   = `translate3d(0, ${y * 0.16}px, 0)`
  if (orbTeal.value)   orbTeal.value.style.transform    = `translate3d(0, ${-y * 0.11}px, 0)`
  if (orbViolet.value) orbViolet.value.style.transform  = `translate3d(0, ${y * 0.23}px, 0)`

  // Floating notes counter-drift
  if (floatLeft.value)  floatLeft.value.style.transform  = `translate3d(0, ${-y * 0.07}px, 0)`
  if (floatRight.value) floatRight.value.style.transform = `translate3d(0, ${y * 0.07}px, 0)`

  // Hero product window 3D perspective tilt on scroll
  if (heroWindow.value && heroAnimDone) {
    const tilt = Math.min(y * 0.013, 11)
    const ty   = Math.min(y * 0.05, 80)
    heroWindow.value.style.transform = `perspective(1400px) rotateX(${tilt}deg) translateY(${ty}px)`
  }

  ticking = false
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(updateParallax)
    ticking = true
  }
}

// ── Card 3D hover tilt ─────────────────────────────────────────────────────
function setupCardTilt() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const selector = '.feature-row, .showcase-card, .compare-card, .open-source__item, .faq-item, .download-item'
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease'
    })
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      const dx   = (e.clientX - cx) / (rect.width  / 2)
      const dy   = (e.clientY - cy) / (rect.height / 2)
      card.style.transform  = `perspective(900px) rotateY(${dx * 7}deg) rotateX(${-dy * 5}deg) translateZ(14px) scale(1.015)`
      card.style.boxShadow  = `0 28px 64px rgba(0,0,0,0.32), 0 0 0 1px rgba(173,198,255,0.18)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.55s ease'
      card.style.transform  = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)'
      card.style.boxShadow  = ''
    })
  })
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
let revealObserver = null

onMounted(() => {
  revealObserver = setupScrollReveal()
  window.addEventListener('scroll', onScroll, { passive: true })

  // Wait for hero CSS animation (1.1s) to finish before JS takes over the window transform
  setTimeout(() => {
    heroAnimDone = true
    if (heroWindow.value) {
      heroWindow.value.style.animation = 'none'
    }
  }, 1200)

  // Card tilt initialised after a short settle
  setTimeout(setupCardTilt, 300)
})

onUnmounted(() => {
  revealObserver?.disconnect()
  window.removeEventListener('scroll', onScroll)
})

// ── Static data ────────────────────────────────────────────────────────────
const heroMeta = [
  { label: 'Platforms', value: 'Windows, macOS, Linux' },
  { label: 'Core stack', value: 'Electron, Vue, Monaco' },
  { label: 'Release flow', value: 'Tagged builds with CI' },
]

const editorLines = [
  'release:',
  '  semanticVersioning: automatic',
  '  tags: generated-by-ci',
  '  binaries:',
  '    windows: ready',
  '    macos: ready',
  '    linux: ready',
  '',
  'workspace:',
  '  search: enabled',
  '  terminalDock: integrated',
  '  builtInSkills:',
  '    - developer-tools',
  '    - text-tools',
  '    - selection-tools',
]

const proofItems = [
  'Monaco editing',
  'Workspace search',
  'Command palette',
  'Integrated terminal',
  'Built-in skills',
  'Cross-platform packaging',
]

const pillars = [
  {
    kicker: 'Focused',
    title: 'Fast enough for everyday editing without feeling stripped down.',
    body: 'AuroraPad is designed to keep opening, searching, editing, and saving feeling immediate instead of heavy.',
  },
  {
    kicker: 'Project-aware',
    title: 'Structured for repository work, not just single files.',
    body: 'Project search, session restore, terminal context, release automation, and persistent preferences extend it beyond a simple text editor.',
  },
  {
    kicker: 'Extensible',
    title: 'Open to plugin skills and workflow shaping.',
    body: 'Built-in tools and JavaScript plugins make it practical to adapt AuroraPad to the way you like to work.',
  },
]

const features = [
  {
    index: '01',
    kicker: 'Editor core',
    title: 'Monaco editing with desktop-native controls.',
    body: 'Language-aware editing, minimap, wrapping, whitespace visibility, bookmarks, split view, font controls, and session persistence are built into the workspace.',
  },
  {
    index: '02',
    kicker: 'Workspace flow',
    title: 'Navigation and search built around repositories.',
    body: 'Open a folder, move through the tree, jump with the command palette, and search across the project without leaving the editor rhythm.',
  },
  {
    index: '03',
    kicker: 'Terminal context',
    title: 'Integrated terminals that respect the active project.',
    body: 'Terminal sessions open in context, expose available shell profiles, and keep command execution close to the files you are editing.',
  },
  {
    index: '04',
    kicker: 'Shipping path',
    title: 'Release management is part of the product story.',
    body: 'AuroraPad ships with semantic versioning, GitHub release automation, and platform-specific build generation for Windows, macOS, and Linux.',
  },
]

const showcaseCards = [
  {
    kicker: 'Command flow',
    title: 'A command palette that behaves like a workspace launcher.',
    body: 'Jump to files, actions, and editor controls from one place instead of hunting through menus.',
    mockupTitle: 'Command Palette',
    mockupMeta: 'Cmd/Ctrl + P',
    className: 'showcase-card--wide',
    lines: ['> open release.yml', '> toggle sidebar', '> find in files', '> open plugins manager'],
  },
  {
    kicker: 'Built-in skills',
    title: 'Useful tools are there immediately, not buried behind setup.',
    body: 'Text transforms, developer helpers, and selection tools make the editor practical from the first run.',
    mockupTitle: 'Built-in Skills',
    mockupMeta: 'ready',
    className: 'showcase-card--accent',
    lines: ['developer-tools', 'text-tools', 'selection-tools', 'plugin-ready architecture'],
  },
  {
    kicker: 'Terminal dock',
    title: 'Run commands where the project already lives.',
    body: 'Keep shell work in-context with visible profiles, active sessions, and cleaner terminal handoff.',
    mockupTitle: 'Terminal Dock',
    mockupMeta: 'project-aware',
    className: '',
    lines: ['$ npm run build', '$ npm run electron:dev', 'zsh • powershell • bash', 'session state: ready'],
  },
]

const manifestoPoints = [
  {
    title: 'Desktop-first polish',
    body: 'The interface is tuned like a real desktop app rather than a browser view wrapped in Electron.',
  },
  {
    title: 'Workflow over feature clutter',
    body: 'The goal is a better editing loop, not a bloated panel maze.',
  },
  {
    title: 'Open-source transparency',
    body: 'The release flow, website, and product direction stay visible in one connected product surface.',
  },
]

const comparisonItems = [
  {
    kicker: 'Lighter than an IDE',
    title: 'Open quickly and stay focused on editing.',
    body: 'AuroraPad is aimed at people who want project capability without carrying the visual and mental weight of a heavyweight IDE all day.',
  },
  {
    kicker: 'Richer than a scratch editor',
    title: 'Keep project search, terminal context, and release awareness close.',
    body: 'It is built for repositories, not just loose files, so the surrounding workflow feels intentional instead of bolted on.',
  },
  {
    kicker: 'More product-minded',
    title: 'Ship, explain, and iterate from the same product surface.',
    body: 'The app, release flow, and website move together, which makes AuroraPad easier to evolve as an actual software product.',
  },
]

const downloads = [
  {
    kicker: 'Windows',
    title: 'Installer and portable builds',
    body: 'Grab packaged Windows releases directly from GitHub release assets.',
  },
  {
    kicker: 'macOS',
    title: 'Native Apple Silicon packages',
    body: 'Download signed-style release artifacts built for a smoother desktop install flow.',
  },
  {
    kicker: 'Linux',
    title: 'AppImage and archive output',
    body: 'Run AuroraPad on Linux without turning the project into a complex setup task.',
  },
]

const artifactRows = [
  {
    platform: 'Windows',
    assets: 'Setup executable, portable executable, latest metadata',
    useCase: 'Best for standard installs or carrying AuroraPad as a portable utility.',
  },
  {
    platform: 'macOS',
    assets: 'DMG package, ZIP archive, update metadata',
    useCase: 'Best for direct desktop installs on Apple Silicon systems.',
  },
  {
    platform: 'Linux',
    assets: 'AppImage, tar.gz archive, release metadata',
    useCase: 'Best for quick runs or keeping AuroraPad inside custom developer environments.',
  },
]

const releaseSteps = [
  {
    index: '01',
    title: 'Version resolves from release history',
    body: 'CI computes the next semantic version and tags the release so builds stay consistent with the project timeline.',
  },
  {
    index: '02',
    title: 'Cross-platform artifacts are generated',
    body: 'Windows, macOS, and Linux packages are built in automation so downloads are ready for real users, not just developers.',
  },
  {
    index: '03',
    title: 'GitHub release becomes the download source',
    body: 'Packaged binaries are attached to the release, and the website points users toward those intended assets first.',
  },
]

const projectItems = [
  {
    kicker: 'App',
    title: 'Desktop editor',
    body: 'The main AuroraPad application is built with Vue, Electron, and Monaco, with persistent preferences and workflow-focused tooling.',
  },
  {
    kicker: 'CI',
    title: 'Semantic releases',
    body: 'Versioning, tags, and packaged binaries are driven by automation so releases stay reproducible and easier to reason about.',
  },
  {
    kicker: 'Web',
    title: 'Product website in the same repo',
    body: 'The marketing site lives inside the project so the product story stays aligned with the actual app and release state.',
  },
]

const faqItems = [
  {
    q: 'Is AuroraPad meant to replace a full IDE?',
    a: 'It is designed more as a fast, capable desktop editor for focused project work. The goal is to stay lighter than a full IDE while covering the workflow depth many lightweight editors miss.',
  },
  {
    q: 'Can I inspect or modify the project myself?',
    a: 'Yes. AuroraPad is open source, with the desktop app, release workflow, and website developed together.',
  },
  {
    q: 'How do downloads work?',
    a: 'The intended downloads are the packaged binaries attached to GitHub Releases for Windows, macOS, and Linux.',
  },
]

const finalOptions = [
  {
    title: 'Download a build',
    body: 'Start with the latest packaged release for your platform.',
  },
  {
    title: 'Track releases',
    body: 'Use the latest packaged release for your platform and follow product updates from the website.',
  },
  {
    title: 'Adapt the workflow',
    body: 'Use built-in skills, plugins, and project tooling to shape AuroraPad around your own routine.',
  },
]
</script>

<style scoped>
/* ── 3D Scroll Reveal ───────────────────────────────────────────────────── */
/*
  All transform variants share the same function list so CSS can interpolate
  smoothly between any initial state and the revealed neutral state.
  Functions: perspective · rotateX · rotateY · translateX · translateY · scale
*/
[data-reveal] {
  opacity: 0;
  transition:
    opacity  0.82s cubic-bezier(0.23, 1, 0.32, 1),
    transform 0.82s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: opacity, transform;
}

[data-reveal='up'] {
  transform: perspective(900px) rotateX(18deg) rotateY(0deg) translateX(0) translateY(56px) scale(1);
}

[data-reveal='left'] {
  transform: perspective(900px) rotateX(0deg) rotateY(-16deg) translateX(-52px) translateY(0) scale(1);
}

[data-reveal='right'] {
  transform: perspective(900px) rotateX(0deg) rotateY(16deg) translateX(52px) translateY(0) scale(1);
}

[data-reveal='zoom'] {
  transform: perspective(900px) rotateX(10deg) rotateY(0deg) translateX(0) translateY(36px) scale(0.88);
}

[data-reveal].is-revealed {
  opacity: 1;
  transform: perspective(900px) rotateX(0deg) rotateY(0deg) translateX(0) translateY(0) scale(1);
}

/* Reduced-motion: skip all animation */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* ── Card tilt: performance hint ────────────────────────────────────────── */
.feature-row,
.showcase-card,
.compare-card,
.open-source__item,
.faq-item,
.download-item {
  will-change: transform;
}

/* ── Product window: parallax baseline ──────────────────────────────────── */
.product-window {
  transform-origin: center top;
  will-change: transform;
}

/* ── Base site ─────────────────────────────────────────────────────────── */
.aurora-site {
  color: #eef5ff;
  background:
    radial-gradient(circle at 15% 18%, rgba(15, 99, 233, 0.24), transparent 22%),
    radial-gradient(circle at 84% 16%, rgba(122, 56, 235, 0.24), transparent 24%),
    radial-gradient(circle at 18% 82%, rgba(16, 185, 199, 0.18), transparent 22%),
    #050d1c;
}

.site-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(64px);
  opacity: 0.68;
  will-change: transform;
}

.orb-blue {
  top: -120px;
  left: -80px;
  width: 420px;
  height: 420px;
  background: rgba(15, 99, 233, 0.36);
}

.orb-teal {
  bottom: 12%;
  left: 6%;
  width: 280px;
  height: 280px;
  background: rgba(16, 185, 199, 0.22);
}

.orb-violet {
  top: 8%;
  right: -90px;
  width: 360px;
  height: 360px;
  background: rgba(122, 56, 235, 0.26);
}

.mesh {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 85%);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  padding: 16px 20px 0;
}

.site-header__inner {
  max-width: 1360px;
  margin: 0 auto;
  padding: 12px 14px;
  border: 1px solid rgba(171, 196, 255, 0.14);
  border-radius: 22px;
  background: rgba(7, 15, 30, 0.66);
  backdrop-filter: blur(22px) saturate(140%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  animation: rise-in 0.7s ease both;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.brand__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
}

.brand__copy {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.brand__copy strong {
  font-size: 15px;
  font-weight: 700;
}

.brand__copy small {
  color: rgba(216, 229, 255, 0.72);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 28px;
}

.site-nav--desktop {
  display: flex;
}

.site-nav a,
.site-footer__links a {
  color: rgba(227, 237, 255, 0.82);
  text-decoration: none;
  transition: color 0.16s ease;
}

.site-nav a:hover,
.site-footer__links a:hover,
.release-link-group a:hover {
  color: #ffffff;
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero {
  padding: 48px 20px 30px;
}

.hero__inner,
.proof-strip__inner,
.section,
.site-footer__inner {
  max-width: 1360px;
  margin: 0 auto;
}

.hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 44px;
  align-items: center;
  min-height: calc(100svh - 124px);
}

.eyebrow {
  display: inline-block;
  margin: 0 0 14px;
  color: #91dfff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero__copy h1,
.section-head h2,
.workspace-story__intro h2,
.manifesto-card h2,
.final-cta__shell h2 {
  margin: 0;
  font-family: 'Space Grotesk', 'Avenir Next', 'Segoe UI Variable Display', sans-serif;
  font-weight: 700;
  letter-spacing: -0.055em;
}

.hero__copy h1 {
  max-width: 11ch;
  font-size: clamp(3.7rem, 7vw, 6.8rem);
  line-height: 0.94;
  animation: rise-in 0.8s ease both;
}

.hero__body {
  max-width: 53ch;
  margin: 20px 0 0;
  color: rgba(221, 232, 250, 0.8);
  font-size: 1.05rem;
  line-height: 1.75;
  animation: rise-in 0.9s ease both;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
  animation: rise-in 1s ease both;
}

.hero__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
  animation: rise-in 1.1s ease both;
}

.hero__meta-item {
  padding: 18px 18px 16px;
  border-radius: 20px;
  border: 1px solid rgba(168, 194, 255, 0.14);
  background: rgba(11, 20, 39, 0.52);
  backdrop-filter: blur(16px);
}

.hero__meta-item span {
  display: block;
  color: rgba(160, 183, 227, 0.78);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.hero__meta-item strong {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.hero__visual {
  position: relative;
  min-height: 720px;
  display: flex;
  align-items: center;
}

.product-window {
  position: relative;
  width: min(760px, 100%);
  margin-left: auto;
  border-radius: 34px;
  overflow: hidden;
  border: 1px solid rgba(173, 198, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(19, 29, 54, 0.96) 0%, rgba(9, 18, 36, 0.98) 100%);
  box-shadow:
    0 34px 90px rgba(0, 0, 0, 0.38),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  animation: float-in-3d 1.2s cubic-bezier(0.23, 1, 0.32, 1) both;
  transition: box-shadow 0.3s ease;
}

.product-window:hover {
  box-shadow:
    0 48px 110px rgba(0, 0, 0, 0.48),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 0 80px rgba(15, 99, 233, 0.1);
}

.product-window__top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(173, 198, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
}

.traffic {
  display: flex;
  gap: 8px;
}

.traffic span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

.traffic span:nth-child(1) { background: #ff6d7a; }
.traffic span:nth-child(2) { background: #f4c15d; }
.traffic span:nth-child(3) { background: #32d2a3; }

.product-window__title {
  color: rgba(232, 239, 255, 0.88);
  font-size: 13px;
  font-weight: 600;
}

.product-window__badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(15, 99, 233, 0.18);
  color: #a9d7ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-window__body {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 560px;
}

.workspace-sidebar {
  padding: 22px 18px;
  border-right: 1px solid rgba(173, 198, 255, 0.1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
}

.workspace-sidebar__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
  color: rgba(209, 223, 255, 0.78);
  font-size: 13px;
}

.workspace-label {
  color: rgba(143, 170, 224, 0.68);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workspace-editor {
  display: flex;
  flex-direction: column;
}

.workspace-tabs {
  display: flex;
  gap: 8px;
  padding: 14px 18px 0;
}

.workspace-tabs span {
  padding: 8px 12px;
  border-radius: 14px 14px 0 0;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(208, 220, 248, 0.68);
  font-size: 12px;
}

.workspace-tabs .is-active {
  background: rgba(15, 99, 233, 0.16);
  color: #dfeeff;
}

.workspace-code {
  flex: 1;
  padding: 24px 22px 20px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.75;
  color: rgba(219, 232, 255, 0.92);
}

.workspace-code__line {
  white-space: pre-wrap;
}

.workspace-terminal {
  margin: 0 18px 18px;
  border: 1px solid rgba(132, 159, 219, 0.16);
  border-radius: 20px;
  overflow: hidden;
  background: rgba(4, 11, 24, 0.7);
}

.workspace-terminal__head,
.workspace-terminal__body {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}

.workspace-terminal__head {
  color: rgba(149, 181, 237, 0.72);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(132, 159, 219, 0.14);
}

.workspace-terminal__body {
  flex-direction: column;
  color: rgba(204, 244, 232, 0.9);
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 12px;
}

.floating-note {
  position: absolute;
  max-width: 230px;
  padding: 18px 18px 16px;
  border-radius: 20px;
  border: 1px solid rgba(173, 198, 255, 0.14);
  background: rgba(7, 17, 34, 0.78);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
  animation: rise-in 1.2s ease both;
  will-change: transform;
}

.floating-note strong {
  display: block;
  line-height: 1.45;
}

.floating-note .eyebrow {
  margin-bottom: 8px;
}

.floating-note--left  { left: -18px;  bottom: 92px; }
.floating-note--right { right: -24px; top: 110px; }

.proof-strip {
  padding: 12px 20px 0;
}

.proof-strip__inner {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.proof-strip__inner span {
  display: flex;
  justify-content: center;
  padding: 16px 12px;
  border-top: 1px solid rgba(173, 198, 255, 0.14);
  color: rgba(201, 216, 245, 0.72);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.section {
  padding: 110px 20px 0;
}

.section-head {
  max-width: 880px;
}

.section-head--compact {
  max-width: 580px;
}

.section-head h2,
.workspace-story__intro h2,
.manifesto-card h2,
.final-cta__shell h2 {
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 0.98;
}

.editorial-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  margin-top: 34px;
}

.editorial-column {
  padding-top: 22px;
  border-top: 1px solid rgba(173, 198, 255, 0.14);
}

.editorial-column h3,
.feature-row h3,
.manifesto-point strong,
.open-source__item h3,
.faq-item h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
}

.editorial-column p,
.feature-row p,
.workspace-story__intro p,
.manifesto-point p,
.download-item p,
.open-source__item p,
.faq-item p,
.release-callout,
.site-footer p {
  color: rgba(207, 219, 243, 0.78);
  line-height: 1.75;
}

.workspace-story__grid,
.release-grid,
.open-source__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 42px;
}

.workspace-story__list {
  display: grid;
  gap: 18px;
}

.showcase-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
  margin-top: 34px;
}

.showcase-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  padding: 22px;
  border-radius: 30px;
  border: 1px solid rgba(173, 198, 255, 0.13);
  background: rgba(9, 18, 35, 0.56);
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.18);
}

.showcase-card--wide {
  grid-row: span 2;
}

.showcase-card--accent {
  background:
    radial-gradient(circle at top right, rgba(122, 56, 235, 0.14), transparent 26%),
    rgba(9, 18, 35, 0.58);
}

.showcase-card__visual {
  min-height: 220px;
}

.showcase-mockup {
  height: 100%;
  min-height: 220px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(173, 198, 255, 0.14);
  background: linear-gradient(180deg, rgba(18, 30, 58, 0.96), rgba(8, 16, 32, 0.98));
}

.showcase-mockup__bar {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(173, 198, 255, 0.12);
  color: rgba(226, 236, 255, 0.84);
  font-size: 12px;
  font-weight: 600;
}

.showcase-mockup__bar small {
  color: rgba(147, 185, 245, 0.72);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.showcase-mockup__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 16px;
  color: rgba(214, 229, 255, 0.84);
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.7;
}

.showcase-card__copy h3 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.35;
}

.showcase-card__copy p {
  margin: 10px 0 0;
  color: rgba(207, 219, 243, 0.78);
  line-height: 1.75;
}

.feature-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 18px;
  padding: 24px;
  border-radius: 26px;
  border: 1px solid rgba(173, 198, 255, 0.13);
  background: rgba(9, 18, 35, 0.54);
  backdrop-filter: blur(14px);
}

.feature-row__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(15, 99, 233, 0.24), rgba(122, 56, 235, 0.18));
  color: #ebf3ff;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.manifesto-card {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 36px;
  padding: 34px;
  border-radius: 34px;
  border: 1px solid rgba(173, 198, 255, 0.14);
  background:
    radial-gradient(circle at top right, rgba(122, 56, 235, 0.12), transparent 28%),
    radial-gradient(circle at bottom left, rgba(16, 185, 199, 0.1), transparent 24%),
    rgba(8, 18, 35, 0.66);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 34px;
}

.compare-card {
  padding: 24px;
  border-radius: 26px;
  border: 1px solid rgba(173, 198, 255, 0.13);
  background: linear-gradient(180deg, rgba(10, 19, 36, 0.62), rgba(8, 16, 32, 0.46));
}

.compare-card h3 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.35;
}

.compare-card p {
  color: rgba(207, 219, 243, 0.78);
  line-height: 1.75;
}

.manifesto-points {
  display: grid;
  gap: 18px;
}

.manifesto-point {
  padding: 18px 0;
  border-top: 1px solid rgba(173, 198, 255, 0.12);
}

.manifesto-point:first-child {
  border-top: none;
  padding-top: 0;
}

.release-grid {
  margin-top: 34px;
}

.download-matrix {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.download-item {
  display: block;
  padding: 24px;
  border-radius: 26px;
  border: 1px solid rgba(173, 198, 255, 0.14);
  background: rgba(10, 19, 36, 0.58);
  color: inherit;
  text-decoration: none;
}

.download-item strong {
  display: block;
  margin-bottom: 8px;
  font-size: 1.15rem;
}

.release-aside {
  display: grid;
  gap: 18px;
  align-content: start;
  padding: 26px;
  border-radius: 28px;
  border: 1px solid rgba(173, 198, 255, 0.13);
  background: rgba(8, 18, 35, 0.52);
}

.release-link-group span {
  display: block;
}

.release-link-group a {
  color: #eef5ff;
  text-decoration: none;
  line-height: 1.7;
  word-break: break-word;
}

.release-callout {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.artifact-matrix {
  margin-top: 22px;
  border-top: 1px solid rgba(173, 198, 255, 0.14);
}

.artifact-matrix__head,
.artifact-matrix__row {
  display: grid;
  grid-template-columns: 180px 1.2fr 1fr;
  gap: 18px;
  padding: 18px 4px;
  align-items: start;
}

.artifact-matrix__head {
  color: rgba(144, 168, 214, 0.72);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.artifact-matrix__row {
  border-top: 1px solid rgba(173, 198, 255, 0.1);
  color: rgba(220, 232, 252, 0.84);
}

.artifact-matrix__row strong {
  font-size: 1rem;
}

.release-flow {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 28px;
  margin-top: 30px;
  padding-top: 28px;
  border-top: 1px solid rgba(173, 198, 255, 0.12);
}

.release-flow__intro h3 {
  margin: 0;
  font-size: 1.9rem;
  line-height: 1.05;
}

.release-flow__steps {
  display: grid;
  gap: 14px;
}

.release-step {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid rgba(173, 198, 255, 0.1);
}

.release-step:first-child {
  border-top: none;
  padding-top: 0;
}

.release-step__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 99, 233, 0.24), rgba(16, 185, 199, 0.18));
  color: #ebf3ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.release-step strong {
  display: block;
  font-size: 1.05rem;
}

.release-step p {
  margin: 8px 0 0;
  color: rgba(207, 219, 243, 0.78);
  line-height: 1.7;
}

.open-source__items {
  display: grid;
  gap: 18px;
}

.open-source__item {
  padding: 22px 24px;
  border-radius: 24px;
  border: 1px solid rgba(173, 198, 255, 0.13);
  background: rgba(10, 19, 36, 0.54);
}

.faq-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 34px;
}

.faq-item {
  padding: 24px;
  border-top: 1px solid rgba(173, 198, 255, 0.18);
}

.final-cta {
  padding-bottom: 92px;
}

.final-cta__shell {
  padding: 42px;
  border-radius: 34px;
  border: 1px solid rgba(173, 198, 255, 0.16);
  background:
    radial-gradient(circle at top right, rgba(15, 99, 233, 0.2), transparent 26%),
    radial-gradient(circle at bottom left, rgba(122, 56, 235, 0.18), transparent 24%),
    rgba(10, 19, 36, 0.72);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
}

.final-cta__options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.final-cta__option {
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(173, 198, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.final-cta__option strong {
  display: block;
  margin-bottom: 8px;
  font-size: 1rem;
}

.final-cta__option span {
  color: rgba(207, 219, 243, 0.78);
  line-height: 1.7;
}

.site-footer {
  padding: 0 20px 34px;
}

.site-footer__inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-top: 28px;
  border-top: 1px solid rgba(173, 198, 255, 0.14);
}

.site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

/* ── Keyframes ──────────────────────────────────────────────────────────── */
@keyframes rise-in {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes float-in-3d {
  from {
    opacity: 0;
    transform: perspective(1400px) rotateX(22deg) rotateY(-4deg) translateY(48px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: perspective(1400px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1);
  }
}

/* ── Buttons ────────────────────────────────────────────────────────────── */
.site-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  color: #edf5ff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
}

.site-btn:hover { transform: translateY(-2px); }

.site-btn--primary {
  background: linear-gradient(135deg, #0f63e9 0%, #7a38eb 100%);
  box-shadow: 0 16px 36px rgba(15, 99, 233, 0.28);
}

.site-btn--outline {
  border-color: rgba(169, 197, 255, 0.24);
  background: rgba(255, 255, 255, 0.02);
}

.site-btn--large {
  min-height: 54px;
  padding: 0 22px;
  font-size: 15px;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1180px) {
  .hero__inner,
  .workspace-story__grid,
  .release-grid,
  .open-source__grid,
  .manifesto-card {
    grid-template-columns: 1fr;
  }

  .hero__visual { min-height: auto; }
  .floating-note { display: none; }

  .download-matrix,
  .faq-list,
  .editorial-columns,
  .showcase-grid,
  .compare-grid,
  .final-cta__options {
    grid-template-columns: 1fr;
  }

  .release-flow { grid-template-columns: 1fr; }
  .proof-strip__inner { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .site-header { padding: 14px 14px 0; }
  .site-header__inner { padding: 10px 12px; }
  .brand__copy small { display: none; }
  .hero { padding: 36px 14px 20px; }

  .section,
  .site-footer,
  .proof-strip {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero__copy h1 {
    max-width: 12ch;
    font-size: clamp(3rem, 13vw, 4.8rem);
  }

  .hero__meta { grid-template-columns: 1fr; }

  .product-window__body { grid-template-columns: 1fr; }

  .workspace-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(173, 198, 255, 0.1);
  }

  .proof-strip__inner { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .manifesto-card,
  .final-cta__shell { padding: 26px; }

  .artifact-matrix__head,
  .artifact-matrix__row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .site-footer__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .site-nav--desktop    { display: none; }
  .site-header__actions { display: none; }

  .hero__actions { width: 100%; }
  .hero__actions .site-btn { width: 100%; }

  .workspace-tabs { flex-wrap: wrap; }

  .feature-row {
    grid-template-columns: 1fr;
  }

  .feature-row__index {
    width: 48px;
    height: 48px;
  }

  .proof-strip__inner { grid-template-columns: 1fr; }
}
</style>
