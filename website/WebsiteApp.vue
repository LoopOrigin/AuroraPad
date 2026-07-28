<template>
  <div class="site">
    <!-- Fixed backgrounds -->
    <div class="site-bg" aria-hidden="true"></div>
    <div class="site-grid" aria-hidden="true"></div>

    <div class="wrap">

      <!-- NAV -->
      <header class="nav">
        <div class="nav-i">
          <a href="#top" class="brand" aria-label="AuroraPad home">
            <img class="logo" :src="appIcon" alt="AuroraPad" />
            <div>
              <div class="brand-name">AuroraPad</div>
              <div class="brand-tag">Desktop editor</div>
            </div>
          </a>
          <nav class="nav-links" aria-label="Primary">
            <a href="#features" @click="handleSectionNavigation('features', 'header-nav')">Features</a>
            <a href="#remote" @click="handleSectionNavigation('remote', 'header-nav')">Remote</a>
            <a href="#tools" @click="handleSectionNavigation('tools', 'header-nav')">Tools</a>
            <a href="#releases" @click="handleSectionNavigation('releases', 'header-nav')">Releases</a>
            <a href="#faq" @click="handleSectionNavigation('faq', 'header-nav')">FAQ</a>
          </nav>
          <a class="nav-cta" :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_header', downloadUrl, 'header')">Download Free</a>
        </div>
      </header>

      <!-- HERO -->
      <section id="top" class="hero">
        <div class="hero-i">
          <div class="hero-copy">
            <span class="ey">Free &middot; Open source &middot; Windows &middot; macOS &middot; Linux</span>
            <h1 class="hero-h1">Edit, SSH, commit &amp; ship<br><span class="ac">&mdash;&nbsp;one desktop app.</span></h1>
            <p class="hero-p">
              Monaco editor (VS Code's core), integrated SSH/SFTP client, Git panel,
              multi-shell terminal, and 30+ editing tools. No extension marketplace.
              No setup. Everything built in.
            </p>
            <div class="hero-acts">
              <a class="btn-p" :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_hero', downloadUrl, 'hero')">
                <svg width="15" height="15" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M8 2v8m-3-3 3 3 3-3M3 13h10"/></svg>
                Download Latest
              </a>
              <a class="btn-g" :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_releases', downloadUrl, 'hero')">View all releases &rarr;</a>
            </div>
            <div class="pills">
              <span v-for="pill in heroPills" :key="pill" class="pill">
                <span class="pill-dot" aria-hidden="true"></span>{{ pill }}
              </span>
            </div>
          </div>

          <!-- Editor window mockup -->
          <div class="ew" aria-hidden="true">
            <div class="ew-top">
              <div class="tl"><span class="r"></span><span class="y"></span><span class="g"></span></div>
              <div class="ew-ttl">AuroraPad &mdash; my-project</div>
              <div class="ew-badge">v{{ appVersion }}</div>
            </div>
            <div class="ew-body">
              <div class="ew-sb">
                <span class="sb-lbl">Explorer</span>
                <div class="sb-f">&#128193; src/</div>
                <div class="sb-f on">&#128196; App.vue</div>
                <div class="sb-f">&#128196; settings.js</div>
                <div class="sb-f">&#128196; router.js</div>
                <span class="sb-lbl" style="margin-top:13px">SSH Profiles</span>
                <div class="sb-f on">&#128279; prod-api</div>
                <div class="sb-f">&#128279; staging-db</div>
                <span class="sb-lbl" style="margin-top:13px">Git</span>
                <div class="sb-f" style="color:rgba(74,227,195,0.75)">&#11044; main &middot; 2 changed</div>
              </div>
              <div class="ew-main">
                <div class="ew-tabs">
                  <div class="ew-tab on">App.vue</div>
                  <div class="ew-tab">settings.js</div>
                  <div class="ew-tab">router.js</div>
                </div>
                <div class="ew-code">
                  <span class="cm">&lt;!-- App.vue --&gt;</span><br>
                  <span class="kw">&lt;template&gt;</span><br>
                  &nbsp;&nbsp;<span class="fn">&lt;div</span> <span class="ac">class</span>=<span class="st">"app"</span><span class="fn">&gt;</span><br>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span class="fn">&lt;ActivityBar</span> <span class="ac">@nav</span>=<span class="st">"onNav"</span> <span class="fn">/&gt;</span><br>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span class="fn">&lt;EditorPane</span> <span class="ac">v-if</span>=<span class="st">"screen==='editor'"</span><span class="fn">/&gt;</span><br>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span class="fn">&lt;SshScreen</span> <span class="ac">v-if</span>=<span class="st">"screen==='ssh'"</span> <span class="fn">/&gt;</span><br>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span class="fn">&lt;SftpScreen</span> <span class="ac">v-if</span>=<span class="st">"screen==='sftp'"</span><span class="fn">/&gt;</span><br>
                  &nbsp;&nbsp;<span class="fn">&lt;/div&gt;</span><br>
                  <span class="kw">&lt;/template&gt;</span>
                </div>
                <div class="ew-term">
                  <div class="term-top">
                    <span class="term-lbl">Terminal &mdash; zsh</span>
                    <span style="font-size:9.5px;color:rgba(74,227,195,0.45)">&#9679; 2 sessions</span>
                  </div>
                  <div class="term-body">
                    <div>$ npm run electron:dev</div>
                    <div style="color:rgba(74,227,195,0.72)">&#10003; vite ready on :5173</div>
                    <div style="color:rgba(74,227,195,0.72)">&#10003; electron launched</div>
                    <div style="color:rgba(180,245,232,0.42)">&#9679; watching&hellip;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PROOF STRIP -->
      <div class="proof" aria-label="Key features">
        <div class="proof-i">
          <div v-for="item in proofItems" :key="item" class="proof-it">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 6.5l1.4 1.4L8.5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ item }}
          </div>
        </div>
      </div>

      <!-- WHY -->
      <section id="features" class="sec">
        <div class="sec-i">
          <div class="sec-hd" data-reveal="up">
            <span class="ey">Why AuroraPad</span>
            <h2>Monaco editor, SSH/SFTP, Git, and 30+ tools &mdash; without the extension sprawl.</h2>
            <p>Open a folder and every feature is immediately available. No marketplace. No configuration. No rebuilds.</p>
          </div>
          <div class="pillars">
            <article
              v-for="(item, i) in pillars"
              :key="item.title"
              class="pc"
              data-reveal="up"
              :data-reveal-delay="i * 130"
            >
              <div class="pc-icon" aria-hidden="true" v-html="item.icon"></div>
              <span class="ey" style="margin-bottom:7px">{{ item.kicker }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- FEATURE ROWS -->
      <section class="sec" style="padding-top:60px">
        <div class="sec-i">
          <div class="sec-hd" data-reveal="up">
            <span class="ey">Every Feature</span>
            <h2>Six built-in capabilities. Nothing to install.</h2>
          </div>
          <div class="frows">
            <article
              v-for="(feature, i) in features"
              :key="feature.index"
              class="fr"
              data-reveal="up"
              :data-reveal-delay="i * 80"
            >
              <div class="fn-num" aria-hidden="true">{{ feature.index }}</div>
              <div>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.body }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- SHOWCASE -->
      <section id="remote" class="sec">
        <div class="sec-i">
          <div class="sec-hd" data-reveal="up">
            <span class="ey">Showcase</span>
            <h2>Command palette, SSH manager, SFTP browser &mdash; all built in.</h2>
            <p>Three tools that typically require separate apps or dozens of extensions. All ready on first launch.</p>
          </div>
          <div class="sg">
            <article
              v-for="(card, i) in showcaseCards"
              :key="card.title"
              class="sc"
              :class="card.className"
              data-reveal="up"
              :data-reveal-delay="i * 120"
            >
              <div class="sm">
                <div class="sm-bar">{{ card.mockupTitle }} <small>{{ card.mockupMeta }}</small></div>
                <div class="sm-body" v-html="card.mockupHtml"></div>
              </div>
              <span class="ey" style="margin-bottom:7px">{{ card.kicker }}</span>
              <h3>{{ card.title }}</h3>
              <p>{{ card.body }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- BUILT-IN TOOLS -->
      <section id="tools" class="sec">
        <div class="sec-i">
          <div class="sec-hd" data-reveal="up">
            <span class="ey">Built-in Skills</span>
            <h2>8 skill packs, 30+ tools &mdash; installed, zero setup.</h2>
            <p>Available from the Plugin menu and command palette on first launch. Add your own with a plain JavaScript file &mdash; no build step.</p>
          </div>
          <div class="tg">
            <article
              v-for="(pack, i) in toolPacks"
              :key="pack.name"
              class="tc"
              :class="{ hi: pack.highlight }"
              data-reveal="up"
              :data-reveal-delay="i * 60"
            >
              <h4>{{ pack.name }}</h4>
              <div class="tc-items">
                <span v-for="tool in pack.tools" :key="tool" class="tc-item">{{ tool }}</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- RELEASES -->
      <section id="releases" class="sec">
        <div class="sec-i">
          <div class="sec-hd" data-reveal="up">
            <span class="ey">Releases</span>
            <h2>One tag. Three platforms. Built &amp; published automatically.</h2>
            <p>Push a version tag and GitHub Actions builds Windows, macOS, and Linux in parallel. Every release ships a real installer.</p>
          </div>
          <div class="dg">
            <a
              v-for="(dl, i) in downloads"
              :key="dl.platform"
              class="dc-card"
              :href="downloadUrl"
              target="_blank"
              rel="noreferrer"
              data-reveal="up"
              :data-reveal-delay="i * 120"
              @click="handleOutboundClick(`download_${dl.platform.toLowerCase()}`, downloadUrl, 'download-grid')"
            >
              <div class="dc-plat">{{ dl.platform }}</div>
              <h3>{{ dl.title }}</h3>
              <p>{{ dl.body }}</p>
              <div class="chips">
                <span v-for="chip in dl.chips" :key="chip" class="chip">{{ chip }}</span>
              </div>
            </a>
          </div>

          <div class="pipeline" data-reveal="up">
            <div v-for="(step, i) in releaseSteps" :key="step.index" class="pipe-wrap">
              <div class="ps">
                <div class="ps-num" aria-hidden="true">{{ step.index }}</div>
                <h4>{{ step.title }}</h4>
                <p>{{ step.body }}</p>
              </div>
              <div v-if="i < releaseSteps.length - 1" class="pa" aria-hidden="true">&rarr;</div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="sec">
        <div class="sec-i">
          <div class="sec-hd" data-reveal="up">
            <span class="ey">FAQ</span>
            <h2>Common questions about features, remote support, plugins, and releases.</h2>
          </div>
          <div class="faq">
            <article
              v-for="(item, i) in faqItems"
              :key="item.q"
              class="faq-it"
              data-reveal="up"
              :data-reveal-delay="i * 90"
            >
              <h3>{{ item.q }}</h3>
              <p>{{ item.a }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <div class="cta-wrap">
        <div class="cta-card" data-reveal="up">
          <div>
            <span class="ey">Download AuroraPad</span>
            <h2>Monaco &middot; SSH/SFTP &middot; Git &middot; terminal &middot; 30+ tools. Free.</h2>
            <p>No account required. No extension marketplace. Everything built in. Ships as a real installer for Windows, macOS, and Linux.</p>
          </div>
          <div class="cta-acts">
            <a class="btn-p" :href="downloadUrl" target="_blank" rel="noreferrer" style="white-space:nowrap" @click="handleOutboundClick('download_cta', downloadUrl, 'cta')">Download Latest &rarr;</a>
            <span class="cta-note">Windows &middot; macOS &middot; Linux</span>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <footer class="footer">
        <div class="footer-i">
          <div class="footer-brand">
            <strong>AuroraPad</strong>
            <p>Cross-platform desktop editor built for real project work.</p>
          </div>
          <div class="footer-links">
            <a :href="downloadUrl" target="_blank" rel="noreferrer" @click="handleOutboundClick('download_footer', downloadUrl, 'footer')">Releases</a>
            <a href="#features" @click="handleSectionNavigation('features', 'footer')">Features</a>
            <a href="#remote" @click="handleSectionNavigation('remote', 'footer')">Remote</a>
            <a href="#tools" @click="handleSectionNavigation('tools', 'footer')">Tools</a>
            <a href="#faq" @click="handleSectionNavigation('faq', 'footer')">FAQ</a>
            <NuxtLink to="/terms" @click="handleLegalNavigation('terms', 'footer')">Terms</NuxtLink>
            <NuxtLink to="/privacy" @click="handleLegalNavigation('privacy', 'footer')">Privacy</NuxtLink>
            <NuxtLink to="/usage" @click="handleLegalNavigation('usage', 'footer')">Usage</NuxtLink>
            <NuxtLink to="/license" @click="handleLegalNavigation('license', 'footer')">License</NuxtLink>
          </div>
        </div>
      </footer>

    </div><!-- /wrap -->
  </div><!-- /site -->
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import appIcon from '../assets/aurorapad-app-icon.png'
import { downloadUrl } from './data/site'
const { trackNavigation, trackOutboundLink } = useSiteAnalytics()

const appVersion = '0.1.12'

function handleOutboundClick(label, destination, placement) {
  trackOutboundLink(label, destination, placement)
}
function handleSectionNavigation(section, placement) {
  trackNavigation(`section_${section}`, `#${section}`, placement)
}
function handleLegalNavigation(page, placement) {
  trackNavigation(`legal_${page}`, `/${page}`, placement)
}

// ── Scroll reveal ──────────────────────────────────────────────────────────
function setupScrollReveal() {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'))
    return null
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el    = entry.target
        const delay = parseInt(el.dataset.revealDelay || '0', 10)
        el.style.transitionDelay = `${delay}ms`
        requestAnimationFrame(() => el.classList.add('is-revealed'))
        setTimeout(() => { el.style.transitionDelay = '0ms' }, delay + 900)
        observer.unobserve(el)
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
  )
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
  return observer
}

// ── Card hover tilt ────────────────────────────────────────────────────────
function setupCardTilt() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const sel = '.fr, .sc, .tc, .pc, .faq-it, .dc-card'
  document.querySelectorAll(sel).forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
      card.style.transform = `perspective(900px) rotateY(${dx * 5}deg) rotateX(${-dy * 4}deg) translateZ(10px)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)'
      card.style.transform  = ''
      setTimeout(() => { card.style.transition = '' }, 500)
    })
  })
}

let revealObserver = null
onMounted(() => {
  revealObserver = setupScrollReveal()
  setTimeout(setupCardTilt, 300)
})
onUnmounted(() => {
  revealObserver?.disconnect()
})

// ── Static data ────────────────────────────────────────────────────────────
const heroPills = ['Monaco Editor', 'SSH & SFTP', 'Git Integration', 'Integrated Terminal', '30+ Tools']

const proofItems = ['Monaco Editor', 'SSH & SFTP', 'Git Integration', 'Integrated Terminal', '30+ Tools', 'Free & Open Source']

const pillars = [
  {
    kicker: 'VS Code editor core',
    title: 'Monaco. 100+ languages, zero configuration.',
    body: 'Syntax highlighting, auto-save, format-on-save, bracket colorization, minimap, word wrap, find & replace — all on by default. No extension marketplace needed.',
    icon: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M7 8l2 2-2 2M11 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    kicker: 'Remote-ready',
    title: 'SSH, SFTP, FTP, FTPS — no separate client.',
    body: 'Saved profiles per environment. Key or password auth. Dual-pane file browser. Transfer queue. Port forwarding. SSH terminal tab — all in one panel.',
    icon: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.2" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 7l1.8-1.8M13.5 13l1.8 1.8M6.5 7L4.7 5.2M6.5 13l-1.8 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  },
  {
    kicker: 'Batteries included',
    title: '8 skill packs, 30+ tools — installed, no setup.',
    body: 'JSON pretty/minify, Base64, URL encode, sort lines, slugify, wrap in quotes, trim whitespace, insert datetime — and more. Drop a JS file to add your own.',
    icon: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.5h12M4 9.5h8M4 13.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="15" cy="13.5" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M15 12.5v1.5l.8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  },
]

const features = [
  {
    index: '01',
    title: 'Monaco editor — 100+ languages, persistent settings, format on save.',
    body: 'Tab size, word wrap, font size, line numbers, minimap, bracket pair colorization, whitespace visibility, auto-save interval — all configurable and saved across sessions.',
  },
  {
    index: '02',
    title: 'Project navigation — file tree, tabs, command palette, Find in Files.',
    body: 'Open a folder to get a full tree. Find in Files searches every file in the workspace, not just open buffers. Command palette (Ctrl+P / Cmd+P) jumps to any file or action instantly.',
  },
  {
    index: '03',
    title: 'Integrated terminal — multiple shells and sessions, docked below the editor.',
    body: 'Open zsh, bash, PowerShell, Git Bash, or WSL from the terminal dock. Run multiple sessions in tabs. Default shell is auto-detected on first launch.',
  },
  {
    index: '04',
    title: 'SSH & SFTP — profiles, dual-pane browser, transfer queue, port forwarding.',
    body: 'Group servers by environment. Connect with SSH key or password. Browse local and remote files side-by-side. Upload/download with a queue. Forward ports. Open SSH terminal in a tab.',
  },
  {
    index: '05',
    title: 'Git integration — stage, commit, and track changes from the sidebar.',
    body: 'Git panel shows staged and unstaged files with M/A badges. Write commit messages and commit without leaving the editor. Branch name shows in the status bar. Modified files are marked in the tree.',
  },
  {
    index: '06',
    title: 'Built-in skills — 30+ editing tools on first launch, no configuration.',
    body: 'JSON pretty/minify, Base64, URL encode/decode, title case, slugify, reverse lines, sort lines, remove duplicates, trim whitespace, tabs↔spaces, insert datetime, selection statistics, and more.',
  },
]

const showcaseCards = [
  {
    kicker: 'Command palette',
    title: 'Every file, action, and setting — one keystroke away.',
    body: 'Ctrl+P opens the palette. Jump to any file, run a built-in skill, toggle editor settings, or navigate to any screen without touching the mouse.',
    mockupTitle: 'Command Palette',
    mockupMeta: 'Ctrl+P / Cmd+P',
    className: 'tall',
    mockupHtml: `
      <div><span class="d">›</span> <span class="h">open</span> App.vue</div>
      <div><span class="d">›</span> <span class="h">find in project</span> "remoteConnect"</div>
      <div><span class="d">›</span> <span class="h">JSON:</span> Pretty Print</div>
      <div><span class="d">›</span> <span class="h">toggle</span> word wrap</div>
      <div><span class="d">›</span> <span class="h">Base64:</span> Encode Selection</div>
      <div><span class="d">›</span> <span class="h">open</span> SSH terminal</div>
    `,
  },
  {
    kicker: 'SSH connections',
    title: 'Server profiles with groups, auth type, and live status.',
    body: 'One click to connect, launch SFTP, or open an SSH terminal tab.',
    mockupTitle: 'SSH Connections',
    mockupMeta: 'production',
    className: 'accent',
    mockupHtml: `
      <div><span class="h">&#11044;</span> api.prod.example.com</div>
      <div style="padding-left:16px;font-size:10px;color:rgba(74,227,195,0.52)">connected · key auth</div>
      <div style="margin-top:6px"><span style="color:rgba(130,160,255,0.58)">&#11044;</span> db.staging.example.com</div>
      <div style="padding-left:16px;font-size:10px;color:rgba(130,160,255,0.48)">online · password auth</div>
    `,
  },
  {
    kicker: 'SFTP file manager',
    title: 'Dual-pane, transfer queue, FTP & FTPS too.',
    body: 'Upload, download, rename, delete, and open remote files directly in the editor.',
    mockupTitle: 'SFTP',
    mockupMeta: 'local ↔ remote',
    className: '',
    mockupHtml: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div style="font-size:9.5px;color:rgba(74,227,195,0.52);margin-bottom:5px">LOCAL</div>
          <div style="font-size:11px">/src/api/</div>
          <div style="font-size:11px;color:rgba(210,228,255,0.52)">auth.js</div>
          <div style="font-size:11px;color:rgba(210,228,255,0.52)">router.js</div>
        </div>
        <div>
          <div style="font-size:9.5px;color:rgba(74,227,195,0.52);margin-bottom:5px">REMOTE</div>
          <div style="font-size:11px">/var/www/api/</div>
          <div style="color:rgba(74,227,195,0.72);font-size:11px">↑ auth.js done</div>
          <div style="color:rgba(74,227,195,0.42);font-size:11px">↑ router.js…</div>
        </div>
      </div>
    `,
  },
]

const toolPacks = [
  { name: 'Developer Tools', tools: ['JSON Pretty Print', 'JSON Minify', 'Base64 Encode / Decode', 'URL Encode / Decode'] },
  { name: 'Text Tools',      tools: ['Convert to Title Case', 'Slugify Selection', 'Selection Statistics'] },
  { name: 'Selection Tools', tools: ['Wrap in Double Quotes', 'Wrap in Single Quotes', 'Wrap in Parentheses', 'Reverse Selected Lines'] },
  { name: 'Whitespace Tools',tools: ['Trim Trailing Whitespace', 'Compress Blank Lines', 'Tabs → Spaces (4)', 'Spaces → Tabs (4)'] },
  { name: 'Sort Lines',      tools: ['Sort A → Z', 'Sort Z → A', 'Remove Duplicate Lines'] },
  { name: 'Smart Edit',      tools: ['Auto Indent', 'Remove Empty Lines', 'Normalize Line Endings'] },
  { name: 'Insert Datetime', tools: ['Insert ISO Date', 'Insert Timestamp', 'Insert Time Only'] },
  { name: '+ Your own plugin', tools: ['Drop a .js file', 'Appears immediately', 'Full editor API', 'No build step'], highlight: true },
]

const downloads = [
  {
    platform: 'Windows',
    title: 'NSIS Installer + Portable EXE',
    body: 'Run the installer for a standard install or use the portable EXE with zero installation needed.',
    chips: ['.exe installer', '.exe portable', 'x64'],
  },
  {
    platform: 'macOS',
    title: 'DMG for Intel & Apple Silicon',
    body: 'Separate x64 and arm64 DMG packages. Open, drag to Applications, done.',
    chips: ['.dmg x64', '.dmg arm64', '.zip'],
  },
  {
    platform: 'Linux',
    title: 'AppImage + Archive',
    body: 'The AppImage runs on any distro without installation. The archive is for custom dev environments.',
    chips: ['.AppImage', '.tar.gz', 'x64'],
  },
]

const releaseSteps = [
  {
    index: '01',
    title: 'Push a version tag',
    body: 'v0.x.x triggers the GitHub Actions release workflow',
  },
  {
    index: '02',
    title: 'Three platforms build in parallel',
    body: 'Windows · macOS · Linux concurrently on GitHub runners',
  },
  {
    index: '03',
    title: 'Artifacts publish to GitHub Releases',
    body: 'Installer, portable, DMG (x64 + arm64), AppImage — all attached',
  },
]

const faqItems = [
  {
    q: 'Does it replace VS Code or a full IDE?',
    a: 'It covers the most common daily workflows — editing, project search, SSH/SFTP, terminal, Git — without extension overhead or memory sprawl. If you need a full debugger or a large extension ecosystem, VS Code is the better fit. AuroraPad is for developers who want a fast, self-contained editor that handles remote work without switching apps.',
  },
  {
    q: 'What remote protocols does it support?',
    a: 'SSH (key or password auth), SFTP, FTP, FTPS, and SCP. Server profiles are grouped by environment and saved with encrypted credentials via the system keychain. Profiles can be imported and exported.',
  },
  {
    q: 'How do I add my own tools?',
    a: 'Drop a JavaScript file in the plugins folder. It appears in the Plugin menu immediately — no build step, no restart. The plugin API exposes the editor content, selection, cursor position, and current file path.',
  },
  {
    q: 'Which shells does the terminal support?',
    a: 'zsh, bash (macOS/Linux), PowerShell, Git Bash, and WSL (Windows). The default shell is detected automatically on first launch. You can switch per session from the terminal dock.',
  },
  {
    q: 'How does the release pipeline work?',
    a: 'Push a version tag. GitHub Actions builds Windows (NSIS installer + portable EXE), macOS (x64 + arm64 DMG), and Linux (AppImage + tar.gz) in parallel and attaches all artifacts to the GitHub Release automatically.',
  },
  {
    q: 'Are preferences saved between sessions?',
    a: 'Yes. Theme, font size, word wrap, tab size, active panel, shell preference, SSH profiles, and recent files all persist. The editor re-opens to the last workspace and layout on each launch.',
  },
]
</script>

<style scoped>
/* ── Tokens ─────────────────────────────────────────────────────────────── */
:root {
  --bg:     #0b0a1a;
  --bg-mid: #171338;
  --bg-te:  #103833;
  --t400:   #34d3a0;
  --t500:   #1B8470;
  --ac:     #4AE3C3;
  --pu:     #534593;
  --text:   #eef5ff;
  --dim:    rgba(220,232,252,0.68);
  --bd:     rgba(255,255,255,0.09);
  --bdt:    rgba(74,227,195,0.16);
  --g1:     rgba(255,255,255,0.048);
  --g2:     rgba(255,255,255,0.076);
}

/* ── Reset ──────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }

/* ── Base ───────────────────────────────────────────────────────────────── */
.site {
  font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
  overflow-x: hidden;
}

h1, h2, h3, h4 {
  font-family: 'Space Grotesk', 'Avenir Next', 'Segoe UI Variable Display', system-ui, sans-serif;
  letter-spacing: -0.032em;
  font-weight: 700;
  line-height: 1.05;
}

/* ── Fixed BG ───────────────────────────────────────────────────────────── */
.site-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 680px 480px at 6% 8%,  rgba(74,227,195,0.14) 0%, transparent 55%),
    radial-gradient(ellipse 560px 400px at 88% 12%, rgba(83,69,147,0.28)  0%, transparent 55%),
    radial-gradient(ellipse 400px 360px at 18% 78%, rgba(27,132,112,0.11) 0%, transparent 50%),
    linear-gradient(148deg, #0b0a1a 0%, #171338 54%, #103833 100%);
}

.site-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(74,227,195,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74,227,195,0.055) 1px, transparent 1px);
  background-size: 60px 60px;
  -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 72%);
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 72%);
}

.wrap { position: relative; z-index: 1; }

/* ── Eyebrow ────────────────────────────────────────────────────────────── */
.ey {
  display: block;
  font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--ac); margin-bottom: 14px;
}

/* ── Nav ────────────────────────────────────────────────────────────────── */
.nav { position: sticky; top: 0; z-index: 50; padding: 16px 24px 0; }
.nav-i {
  max-width: 1280px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 10px 14px 10px 12px; border-radius: 20px;
  border: 1px solid rgba(74,227,195,0.14);
  background: rgba(8,10,22,0.76);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
}

.brand { display: flex; align-items: center; gap: 10px; }
.logo { width: 34px; height: 34px; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.28); flex-shrink: 0; }
.brand-name { font-family: 'Space Grotesk', sans-serif; font-size: 14.5px; font-weight: 700; }
.brand-tag { font-size: 9.5px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(74,227,195,0.62); }

.nav-links { display: flex; align-items: center; gap: 22px; }
.nav-links a { font-size: 13.5px; font-weight: 500; color: var(--dim); transition: color .15s; }
.nav-links a:hover { color: var(--text); }

.nav-cta {
  padding: 8px 18px; border-radius: 999px;
  font-size: 13.5px; font-weight: 600;
  background: linear-gradient(135deg, var(--t500), var(--t400));
  color: #071510; box-shadow: 0 8px 22px rgba(27,132,112,0.30);
  transition: transform .15s, box-shadow .15s; white-space: nowrap;
}
.nav-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(27,132,112,0.40); }

/* ── Buttons ────────────────────────────────────────────────────────────── */
.btn-p {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 26px; border-radius: 999px;
  font-size: 15px; font-weight: 600;
  background: linear-gradient(135deg, var(--t500) 0%, var(--t400) 100%);
  color: #071510; box-shadow: 0 12px 32px rgba(27,132,112,0.28);
  transition: transform .18s, box-shadow .18s;
}
.btn-p:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(27,132,112,0.42); }

.btn-g {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 26px; border-radius: 999px;
  font-size: 15px; font-weight: 600;
  border: 1px solid var(--bdt); color: var(--dim);
  transition: border-color .15s, color .15s;
}
.btn-g:hover { border-color: var(--ac); color: var(--text); }

/* ── Hero ───────────────────────────────────────────────────────────────── */
.hero {
  min-height: calc(100svh - 80px);
  padding: 44px 24px 36px;
  display: flex; align-items: center;
}
.hero-i {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1.08fr;
  gap: 48px; align-items: center; width: 100%;
}

.hero-copy {}
.hero-h1 { font-size: clamp(2.8rem, 5.2vw, 5rem); line-height: 0.97; max-width: 14ch; margin-bottom: 20px; }
.hero-h1 .ac { color: var(--ac); }
.hero-p { font-size: 1.04rem; line-height: 1.78; color: var(--dim); max-width: 52ch; margin-bottom: 28px; }
.hero-acts { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 34px; }

.pills { display: flex; flex-wrap: wrap; gap: 8px; }
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 13px; border-radius: 999px;
  font-size: 11.5px; font-weight: 600; letter-spacing: .04em;
  border: 1px solid rgba(74,227,195,0.22);
  background: rgba(74,227,195,0.06); color: var(--ac);
}
.pill-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--ac); flex-shrink: 0; }

/* ── Editor mockup ──────────────────────────────────────────────────────── */
.ew {
  border-radius: 22px; overflow: hidden;
  border: 1px solid rgba(74,227,195,0.14);
  background: linear-gradient(180deg, #121b2e 0%, #080e1c 100%);
  box-shadow: 0 40px 100px rgba(0,0,0,0.50), 0 0 80px rgba(27,132,112,0.10);
  transform: perspective(1100px) rotateY(-5deg) rotateX(2deg);
  transition: transform .45s ease;
  will-change: transform;
}
.ew:hover { transform: perspective(1100px) rotateY(-1deg) rotateX(0deg); }

.ew-top {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid rgba(74,227,195,0.09);
}
.tl { display: flex; gap: 6px; }
.tl span { width: 10px; height: 10px; border-radius: 50%; }
.tl .r { background: #ff6d7a; } .tl .y { background: #f4c15d; } .tl .g { background: #34d3a0; }
.ew-ttl { font-family: 'DM Mono', 'Consolas', monospace; font-size: 11.5px; color: rgba(220,232,252,0.55); flex: 1; text-align: center; }
.ew-badge {
  padding: 3px 10px; border-radius: 999px;
  font-size: 9.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  background: rgba(27,132,112,0.20); color: var(--ac);
}
.ew-body { display: grid; grid-template-columns: 174px 1fr; min-height: 400px; }

.ew-sb { padding: 14px 12px; border-right: 1px solid rgba(74,227,195,0.08); }
.sb-lbl {
  font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  color: rgba(74,227,195,0.50); display: block; margin-bottom: 9px;
}
.sb-f {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 6px; border-radius: 7px;
  font-size: 11.5px; color: rgba(205,220,255,0.70);
  font-family: 'DM Mono', 'Consolas', monospace;
}
.sb-f.on { background: rgba(27,132,112,0.18); color: var(--ac); }

.ew-main { display: flex; flex-direction: column; }
.ew-tabs { display: flex; gap: 3px; padding: 9px 10px 0; border-bottom: 1px solid rgba(74,227,195,0.08); }
.ew-tab {
  padding: 5px 11px; border-radius: 7px 7px 0 0;
  font-size: 10.5px; font-family: 'DM Mono', 'Consolas', monospace;
  color: rgba(205,220,255,0.50);
}
.ew-tab.on { background: rgba(27,132,112,0.18); color: rgba(180,248,232,0.92); }

.ew-code {
  flex: 1; padding: 14px 14px 8px;
  font-family: 'DM Mono', 'Consolas', monospace; font-size: 11.5px; line-height: 1.82;
  color: rgba(218,230,255,0.88);
}
.ew-code .kw { color: #c792ea; }
.ew-code .st { color: #c3e88d; }
.ew-code .fn { color: #82aaff; }
.ew-code .ac { color: #4AE3C3; }
.ew-code .cm { color: rgba(130,170,255,0.42); }

.ew-term {
  margin: 0 10px 10px;
  border: 1px solid rgba(74,227,195,0.12); border-radius: 12px; overflow: hidden;
  background: rgba(4,10,20,0.82);
}
.term-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 11px; border-bottom: 1px solid rgba(74,227,195,0.09);
}
.term-lbl {
  font-size: 9.5px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase;
  color: rgba(74,227,195,0.58);
}
.term-body {
  padding: 9px 11px;
  font-family: 'DM Mono', 'Consolas', monospace; font-size: 10.5px; line-height: 1.72;
  color: rgba(200,242,224,0.85);
}

/* ── Proof strip ────────────────────────────────────────────────────────── */
.proof { padding: 10px 24px 0; }
.proof-i {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(6, 1fr);
  border-top: 1px solid rgba(74,227,195,0.13);
}
.proof-it {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 18px 10px;
  font-size: 11.5px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase;
  color: rgba(74,227,195,0.66);
}
.proof-it svg { flex-shrink: 0; }

/* ── Section ────────────────────────────────────────────────────────────── */
.sec { padding: 96px 24px 0; }
.sec-i { max-width: 1280px; margin: 0 auto; }
.sec-hd { margin-bottom: 46px; }
.sec-hd h2 { font-size: clamp(1.9rem, 3.2vw, 3.2rem); max-width: 820px; margin-bottom: 14px; }
.sec-hd p { font-size: 1.03rem; color: var(--dim); line-height: 1.78; max-width: 58ch; }

/* ── Pillar cards ───────────────────────────────────────────────────────── */
.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.pc {
  padding: 26px 22px; border-radius: 28px;
  border: 1px solid var(--bd); background: var(--g1);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: border-color .2s, background .2s, transform .22s;
}
.pc:hover { border-color: var(--bdt); background: var(--g2); transform: translateY(-3px); }
.pc-icon {
  width: 42px; height: 42px; border-radius: 13px;
  background: linear-gradient(135deg, rgba(27,132,112,0.28), rgba(83,69,147,0.18));
  border: 1px solid rgba(74,227,195,0.12);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; color: var(--ac);
}
.pc-icon :deep(svg) { width: 18px; height: 18px; }
.pc h3 { font-size: 1.06rem; line-height: 1.38; margin-bottom: 9px; }
.pc p { font-size: .9rem; color: var(--dim); line-height: 1.72; }

/* ── Feature rows ───────────────────────────────────────────────────────── */
.frows { display: grid; gap: 12px; }
.fr {
  display: grid; grid-template-columns: 58px 1fr;
  gap: 20px; padding: 22px; align-items: start;
  border-radius: 20px;
  border: 1px solid var(--bd); background: var(--g1);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: border-color .2s, background .2s, transform .2s;
}
.fr:hover { border-color: var(--bdt); background: var(--g2); transform: translateX(4px); }
.fn-num {
  width: 50px; height: 50px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(27,132,112,0.26), rgba(83,69,147,0.20));
  border: 1px solid rgba(74,227,195,0.14);
  font-family: 'DM Mono', 'Consolas', monospace; font-size: 12.5px; font-weight: 700;
  color: var(--ac); letter-spacing: .06em; flex-shrink: 0;
}
.fr h3 { font-size: 1.02rem; margin-bottom: 6px; line-height: 1.38; }
.fr p { font-size: .88rem; color: var(--dim); line-height: 1.72; }

/* ── Showcase ───────────────────────────────────────────────────────────── */
.sg {
  display: grid;
  grid-template-columns: 1.24fr 0.76fr;
  grid-template-rows: auto auto;
  gap: 16px; margin-top: 46px;
}
.sc {
  padding: 22px; border-radius: 28px;
  border: 1px solid var(--bd); background: var(--g1);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: border-color .2s, transform .22s;
}
.sc:hover { border-color: var(--bdt); }
.sc.tall { grid-row: span 2; display: flex; flex-direction: column; }
.sc.accent { background: linear-gradient(140deg, rgba(83,69,147,0.16), rgba(27,132,112,0.10)), var(--g1); }

.sm {
  border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(74,227,195,0.11);
  background: linear-gradient(180deg, #0f1c2e, #080e1c);
  margin-bottom: 16px; flex: 1;
}
.sm-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 13px; border-bottom: 1px solid rgba(74,227,195,0.09);
  font-size: 10.5px; font-weight: 600; color: rgba(218,234,255,0.78);
}
.sm-bar small { font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: rgba(74,227,195,0.60); }
.sm-body {
  padding: 14px 13px;
  font-family: 'DM Mono', 'Consolas', monospace; font-size: 11.5px; line-height: 1.82;
  color: rgba(210,228,255,0.82);
}
.sm-body :deep(.d) { color: rgba(74,227,195,0.52); }
.sm-body :deep(.h) { color: var(--ac); }

.sc h3 { font-size: 1.15rem; margin-bottom: 7px; line-height: 1.32; }
.sc p { font-size: .9rem; color: var(--dim); line-height: 1.72; }

/* ── Tools grid ─────────────────────────────────────────────────────────── */
.tg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 46px; }
.tc {
  padding: 18px; border-radius: 20px;
  border: 1px solid var(--bd); background: var(--g1);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: border-color .2s, transform .2s;
}
.tc:hover { border-color: var(--bdt); transform: translateY(-2px); }
.tc.hi { border-color: var(--bdt); background: rgba(74,227,195,0.04); }
.tc h4 { font-size: .93rem; font-weight: 700; margin-bottom: 8px; color: var(--text); }
.tc.hi h4 { color: var(--ac); }
.tc-items { display: flex; flex-direction: column; gap: 4px; }
.tc-item {
  font-size: 10.5px; color: rgba(74,227,195,0.78);
  font-family: 'DM Mono', 'Consolas', monospace;
  display: flex; align-items: center; gap: 5px;
}
.tc-item::before { content: '›'; color: var(--ac); font-size: 12px; line-height: 1; }

/* ── Downloads ──────────────────────────────────────────────────────────── */
.dg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 46px; }
.dc-card {
  display: block; color: inherit;
  padding: 26px 22px; border-radius: 28px;
  border: 1px solid var(--bdt);
  background: rgba(255,255,255,0.038);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: background .2s, transform .22s;
}
.dc-card:hover { background: rgba(74,227,195,0.058); transform: translateY(-3px); }
.dc-plat { font-size: 10.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--ac); margin-bottom: 9px; }
.dc-card h3 { font-size: 1.08rem; margin-bottom: 7px; }
.dc-card p { font-size: .88rem; color: var(--dim); line-height: 1.66; margin-bottom: 14px; }

.chips { display: flex; flex-wrap: wrap; gap: 5px; }
.chip {
  padding: 3px 9px; border-radius: 6px;
  font-size: 9.5px; font-weight: 700; font-family: 'DM Mono', 'Consolas', monospace;
  background: rgba(74,227,195,0.09);
  color: rgba(74,227,195,0.82);
  border: 1px solid rgba(74,227,195,0.15);
}

/* ── Pipeline ───────────────────────────────────────────────────────────── */
.pipeline {
  display: flex; align-items: center;
  gap: 0; margin-top: 36px; padding: 30px;
  border-radius: 28px;
  border: 1px solid var(--bd); background: var(--g1);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.pipe-wrap { display: contents; }
.ps { flex: 1; text-align: center; padding: 10px; }
.ps-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 11px;
  background: rgba(27,132,112,0.22);
  color: var(--ac); font-family: 'DM Mono', 'Consolas', monospace;
  font-size: 11.5px; font-weight: 700; margin-bottom: 9px;
  border: 1px solid rgba(74,227,195,0.15);
}
.ps h4 { font-size: .93rem; margin-bottom: 5px; }
.ps p { font-size: .82rem; color: var(--dim); line-height: 1.6; }
.pa { color: rgba(74,227,195,0.38); font-size: 22px; padding: 0 8px; flex-shrink: 0; }

/* ── FAQ ────────────────────────────────────────────────────────────────── */
.faq { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-top: 46px; }
.faq-it { padding: 22px; border-top: 1px solid rgba(74,227,195,0.14); }
.faq-it h3 { font-size: .98rem; font-weight: 700; margin-bottom: 9px; line-height: 1.42; }
.faq-it p { font-size: .88rem; color: var(--dim); line-height: 1.78; }

/* ── CTA ────────────────────────────────────────────────────────────────── */
.cta-wrap { padding: 96px 24px 80px; }
.cta-card {
  max-width: 1280px; margin: 0 auto;
  padding: 60px 52px; border-radius: 40px;
  border: 1px solid rgba(74,227,195,0.18);
  background:
    radial-gradient(ellipse 55% 70% at 2% 10%, rgba(27,132,112,0.20) 0%, transparent 55%),
    radial-gradient(ellipse 50% 60% at 98% 90%, rgba(83,69,147,0.18) 0%, transparent 55%),
    rgba(255,255,255,0.046);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 90px rgba(27,132,112,0.12), 0 40px 100px rgba(0,0,0,0.32);
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 40px;
}
.cta-card h2 { font-size: clamp(1.8rem, 2.8vw, 2.6rem); margin-bottom: 12px; }
.cta-card p { font-size: 1rem; color: var(--dim); line-height: 1.74; max-width: 54ch; }
.cta-acts { display: flex; flex-direction: column; gap: 9px; align-items: flex-end; }
.cta-note { font-size: 10.5px; color: rgba(74,227,195,0.56); text-align: center; letter-spacing: .05em; }

/* ── Footer ─────────────────────────────────────────────────────────────── */
.footer { padding: 0 24px 34px; }
.footer-i {
  max-width: 1280px; margin: 0 auto;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 20px;
  padding-top: 26px; border-top: 1px solid rgba(74,227,195,0.10);
}
.footer-brand strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 14.5px; margin-bottom: 3px; }
.footer-brand p { font-size: 12.5px; color: var(--dim); }
.footer-links { display: flex; flex-wrap: wrap; gap: 16px; }
.footer-links a { font-size: 12.5px; color: var(--dim); transition: color .15s; }
.footer-links a:hover { color: var(--text); }

/* ── Scroll reveal ──────────────────────────────────────────────────────── */
[data-reveal] {
  opacity: 0;
  transform: perspective(900px) rotateX(16deg) rotateY(0deg) translateY(48px) scale(1);
  transition:
    opacity  0.72s cubic-bezier(0.23, 1, 0.32, 1),
    transform 0.72s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: opacity, transform;
}
[data-reveal].is-revealed {
  opacity: 1;
  transform: perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1);
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .hero-i, .cta-card { grid-template-columns: 1fr; }
  .ew { display: none; }
  .cta-acts { align-items: flex-start; }
}

@media (max-width: 768px) {
  .pillars, .dg, .tg, .sg { grid-template-columns: 1fr; }
  .faq { grid-template-columns: 1fr; }
  .proof-i { grid-template-columns: repeat(3, 1fr); }
  .nav-links { display: none; }
  .pipeline { flex-direction: column; }
  .pa { transform: rotate(90deg); }
  .sc.tall { grid-row: auto; }
  .hero-h1 { font-size: 2.6rem; }
}
</style>
