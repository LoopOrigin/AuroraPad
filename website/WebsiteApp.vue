<template>
  <v-app class="aurora-site">
    <div class="site-noise" aria-hidden="true"></div>

    <v-app-bar flat color="transparent" class="site-bar px-3 px-md-5">
      <a href="#top" class="brand-link" aria-label="AuroraPad home">
        <div class="brand-mark">A</div>
        <div class="brand-copy">
          <strong>AuroraPad</strong>
          <span>Code editor for focused desktop work</span>
        </div>
      </a>

      <v-spacer />

      <nav class="site-nav d-none d-md-flex" aria-label="Primary">
        <a href="#product">Product</a>
        <a href="#workflow">Workflow</a>
        <a href="#releases">Releases</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div class="site-actions d-none d-md-flex">
        <v-btn variant="text" :href="repoUrl" target="_blank" rel="noreferrer">GitHub</v-btn>
        <v-btn color="primary" :href="downloadUrl" target="_blank" rel="noreferrer">Download</v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <section id="top" class="hero">
        <div class="hero-backdrop" aria-hidden="true"></div>
        <v-container class="hero-container">
          <div class="hero-layout">
            <div class="hero-copy">
              <p class="eyebrow">Desktop editor · Open source · Cross-platform</p>
              <h1 class="hero-title">Fast file editing, project search, terminal context, and plugin-driven workflows in one desktop window.</h1>
              <p class="hero-body">
                AuroraPad is built for developers who want the immediacy of Notepad++,
                the editing depth of Monaco, and a cleaner modern workspace for Windows,
                macOS, and Linux.
              </p>

              <div class="hero-actions">
                <v-btn color="primary" size="x-large" :href="downloadUrl" target="_blank" rel="noreferrer">
                  Download Builds
                </v-btn>
                <v-btn variant="outlined" size="x-large" :href="repoUrl" target="_blank" rel="noreferrer">
                  View Repository
                </v-btn>
              </div>

              <dl class="hero-meta">
                <div>
                  <dt>Platforms</dt>
                  <dd>macOS, Windows, Linux</dd>
                </div>
                <div>
                  <dt>Built With</dt>
                  <dd>Electron, Vue, Monaco, Vuetify</dd>
                </div>
                <div>
                  <dt>Versioning</dt>
                  <dd>CI-managed semantic releases</dd>
                </div>
              </dl>
            </div>

            <div class="hero-visual">
              <div class="hero-frame">
                <div class="frame-top">
                  <div class="frame-dots">
                    <span class="dot red"></span>
                    <span class="dot amber"></span>
                    <span class="dot green"></span>
                  </div>
                  <span class="frame-title">AuroraPad</span>
                  <span class="frame-pill">Workspace Ready</span>
                </div>

                <div class="frame-body">
                  <aside class="frame-sidebar">
                    <span class="frame-label">Project</span>
                    <span>src/</span>
                    <span>plugins/</span>
                    <span>website/</span>
                    <span>electron/</span>
                    <span class="frame-spacer"></span>
                    <span class="frame-label">Recent</span>
                    <span>App.vue</span>
                    <span>TerminalDock.vue</span>
                    <span>WebsiteApp.vue</span>
                  </aside>

                  <div class="frame-editor">
                    <div class="frame-tabs">
                      <span class="is-active">release.yml</span>
                      <span>app.css</span>
                      <span>README.md</span>
                    </div>

                    <pre class="editor-code"><code>release:
  semanticVersioning: true
  platforms:
    - macOS
    - Windows
    - Linux

workspace:
  search: enabled
  commandPalette: enabled
  terminalDock: enabled
  pluginSkills:
    - developer-tools
    - text-tools
    - selection-tools</code></pre>

                    <div class="frame-status">
                      <span>Workspace Search</span>
                      <span>Integrated Terminal</span>
                      <span>Semantic Releases</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="hero-callout hero-callout-top">
                <span class="callout-label">Project Search</span>
                <strong>Jump across the whole workspace</strong>
                <p>Search, filter, open, and continue editing without leaving the app.</p>
              </div>

              <div class="hero-callout hero-callout-bottom">
                <span class="callout-label">Terminal Dock</span>
                <strong>Run commands in context</strong>
                <p>Open the terminal from the active project path and keep your flow intact.</p>
              </div>
            </div>
          </div>
        </v-container>
      </section>

      <section class="proof-strip">
        <v-container>
          <div class="proof-grid">
            <div v-for="proof in proofPoints" :key="proof.label" class="proof-item">
              <span class="proof-value">{{ proof.value }}</span>
              <span class="proof-label">{{ proof.label }}</span>
            </div>
          </div>
        </v-container>
      </section>

      <section id="product" class="section-shell">
        <v-container class="section-container">
          <div class="section-head">
            <p class="eyebrow">Product</p>
            <h2>Designed for the moments where friction usually slows editing down.</h2>
            <p class="section-copy">
              AuroraPad keeps the workspace compact, readable, and desktop-native while
              adding the features that save time every single day.
            </p>
          </div>

          <div class="feature-layout">
            <article class="feature-panel feature-panel-primary">
              <span class="feature-kicker">Editor Surface</span>
              <h3>Familiar structure, cleaner execution.</h3>
              <p>
                Multi-tab editing, split view, file tree navigation, recent files, bookmarks,
                encoding tools, and line-ending control all live in a layout that stays quick to scan.
              </p>
            </article>

            <article v-for="feature in features" :key="feature.title" class="feature-panel">
              <span class="feature-kicker">{{ feature.kicker }}</span>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.body }}</p>
            </article>
          </div>
        </v-container>
      </section>

      <section id="workflow" class="section-shell section-contrast">
        <v-container class="section-container">
          <div class="section-head">
            <p class="eyebrow">Workflow</p>
            <h2>One focused desktop loop from open, to edit, to search, to run.</h2>
          </div>

          <div class="workflow-grid">
            <div v-for="(step, index) in workflowSteps" :key="step.title" class="workflow-step">
              <span class="workflow-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.body }}</p>
              </div>
            </div>
          </div>
        </v-container>
      </section>

      <section class="section-shell">
        <v-container class="section-container">
          <div class="section-head">
            <p class="eyebrow">Built-In Skills</p>
            <h2>Useful out of the box, extensible when your workflow grows.</h2>
          </div>

          <div class="skills-grid">
            <article v-for="skill in skills" :key="skill.title" class="skill-panel">
              <span class="feature-kicker">{{ skill.kicker }}</span>
              <h3>{{ skill.title }}</h3>
              <p>{{ skill.body }}</p>
            </article>
          </div>
        </v-container>
      </section>

      <section id="releases" class="section-shell section-contrast">
        <v-container class="section-container">
          <div class="release-layout">
            <div class="section-head compact">
              <p class="eyebrow">Releases & Links</p>
              <h2>Downloads, source, release automation, and platform packaging in one place.</h2>
              <p class="section-copy">
                AuroraPad ships with CI-managed semantic versioning, automated release builds,
                and GitHub Pages support for the website. Source and binaries stay easy to find.
              </p>
            </div>

            <div class="release-stack">
              <a class="release-link" :href="downloadUrl" target="_blank" rel="noreferrer">
                <span class="feature-kicker">Download URL</span>
                <strong>{{ downloadUrl }}</strong>
                <span class="release-hint">Get packaged desktop builds and release notes.</span>
              </a>

              <a class="release-link" :href="repoUrl" target="_blank" rel="noreferrer">
                <span class="feature-kicker">Repository URL</span>
                <strong>{{ repoUrl }}</strong>
                <span class="release-hint">Browse source, roadmap, issues, and workflows.</span>
              </a>
            </div>
          </div>
        </v-container>
      </section>

      <section id="faq" class="section-shell">
        <v-container class="section-container">
          <div class="section-head">
            <p class="eyebrow">FAQ</p>
            <h2>Common questions, answered quickly.</h2>
          </div>

          <div class="faq-list">
            <article v-for="item in faqItems" :key="item.q" class="faq-item">
              <h3>{{ item.q }}</h3>
              <p>{{ item.a }}</p>
            </article>
          </div>
        </v-container>
      </section>

      <section class="final-cta">
        <v-container class="final-cta-inner">
          <p class="eyebrow">Try AuroraPad</p>
          <h2>Open the repo, download a build, and shape the editor around your workflow.</h2>
          <div class="hero-actions">
            <v-btn color="primary" size="x-large" :href="downloadUrl" target="_blank" rel="noreferrer">
              Download AuroraPad
            </v-btn>
            <v-btn variant="outlined" size="x-large" :href="repoUrl" target="_blank" rel="noreferrer">
              Explore the Source
            </v-btn>
          </div>
        </v-container>
      </section>
    </v-main>
  </v-app>
</template>

<script setup>
const repoUrl = 'https://github.com/ali111887/AuroraPad'
const downloadUrl = 'https://github.com/ali111887/AuroraPad/releases'

const proofPoints = [
  { value: '3', label: 'desktop platforms shipped in CI' },
  { value: '1', label: 'workspace for editing, search, plugins & terminal' },
  { value: '0.1.0+', label: 'semantic release flow managed by CI' },
  { value: 'Built-in', label: 'developer and text skills included' },
]

const features = [
  {
    kicker: 'Workspace Search',
    title: 'Find across folders, not just files',
    body: 'Search the project, jump to exact matches, and stay inside the same focused editing flow.',
  },
  {
    kicker: 'Terminal',
    title: 'Run where the code already is',
    body: 'Use the integrated terminal with platform-aware shell profiles and workspace-aware starting paths.',
  },
  {
    kicker: 'Command Palette',
    title: 'Use intent-driven actions',
    body: 'Trigger editing, navigation, workspace, and sorting actions from one searchable launcher.',
  },
  {
    kicker: 'Customization',
    title: 'Keep the UI under control',
    body: 'Tune sidebar, toolbar, status bar, minimap, wrapping, whitespace, autosave, and theme behavior.',
  },
]

const workflowSteps = [
  {
    title: 'Open a folder & restore context',
    body: 'Bring the project back instantly with recent files, persisted preferences, and session-aware workspace state.',
  },
  {
    title: 'Edit with Monaco-level capability',
    body: 'Work with syntax highlighting, language modes, bookmarks, split view, and editor controls that stay out of the way.',
  },
  {
    title: 'Search & jump across the project',
    body: 'Use command palette flows or find-in-files to move through the codebase without digging through windows and menus.',
  },
  {
    title: 'Run commands in the same workspace',
    body: 'Open the terminal dock from the active project path and keep debugging, building, or testing inside the same tool.',
  },
]

const skills = [
  {
    kicker: 'Developer Tools',
    title: 'Format, encode, hash, and transform',
    body: 'Built-in tools cover JSON formatting, Base64 and URL transforms, and document hashing utilities.',
  },
  {
    kicker: 'Text Tools',
    title: 'Clean up text in place',
    body: 'Slugify text, title-case selections, inspect document stats, and make small content tasks take seconds instead of minutes.',
  },
  {
    kicker: 'Plugin System',
    title: 'Extend the editor with your own actions',
    body: 'Drop JavaScript plugins into the user plugin folder and surface custom actions directly in AuroraPad.',
  },
]

const faqItems = [
  {
    q: 'What is AuroraPad for?',
    a: 'AuroraPad is for developers who want a fast desktop editor for day-to-day file work, code inspection, project search, and terminal-assisted workflows.',
  },
  {
    q: 'Why not just use a browser-based editor?',
    a: 'AuroraPad is optimized for desktop-native editing, file-system access, terminal context, packaging, and lightweight project operations without browser friction.',
  },
  {
    q: 'How are releases managed?',
    a: 'GitHub Actions computes semantic versions from commit history, builds desktop packages for macOS, Windows, and Linux, and publishes release assets automatically.',
  },
]
</script>

<style>
:root {
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #07101a;
}

.aurora-site {
  color: #eef6ff;
  background:
    radial-gradient(circle at 10% 10%, rgba(105, 208, 255, 0.18), transparent 24%),
    radial-gradient(circle at 88% 12%, rgba(69, 126, 255, 0.18), transparent 20%),
    linear-gradient(180deg, #09121f 0%, #07101a 48%, #040911 100%);
}

.site-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85), transparent 92%);
}

.site-bar {
  backdrop-filter: blur(20px);
  background: rgba(7, 13, 24, 0.6) !important;
  border-bottom: 1px solid rgba(163, 205, 255, 0.08);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  text-decoration: none;
  color: inherit;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #8ceaff, #5ca9ff);
  color: #07101a;
  font-family: "Iowan Old Style", "Georgia", serif;
  font-size: 1.45rem;
  font-weight: 700;
  box-shadow: 0 18px 40px rgba(92, 169, 255, 0.28);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-copy strong {
  letter-spacing: 0.03em;
}

.brand-copy span,
.site-nav a,
.section-copy,
.feature-panel p,
.workflow-step p,
.skill-panel p,
.faq-item p,
.release-hint,
.proof-label {
  color: #a8b9cd;
}

.site-nav,
.site-actions {
  align-items: center;
  gap: 1.15rem;
}

.site-nav a {
  text-decoration: none;
  transition: color 0.18s ease;
}

.site-nav a:hover,
.brand-link:hover .brand-copy strong {
  color: #ffffff;
}

.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
}

.hero-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 40% 32%, rgba(140, 234, 255, 0.11), transparent 22%),
    radial-gradient(circle at 70% 56%, rgba(92, 169, 255, 0.14), transparent 26%);
  pointer-events: none;
}

.hero-container,
.section-container {
  position: relative;
  z-index: 1;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: 3rem;
  min-height: calc(100svh - 64px);
  padding: 5rem 0 2rem;
}

.eyebrow,
.feature-kicker,
.callout-label {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.78rem;
  color: #f2c57c;
}

.hero-title,
.section-head h2,
.final-cta h2 {
  margin: 0;
  font-family: "Iowan Old Style", "Georgia", serif;
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 0.94;
  text-wrap: balance;
}

.hero-title {
  max-width: 11ch;
  font-size: clamp(3.6rem, 7vw, 7.25rem);
}

.hero-body {
  max-width: 58ch;
  margin-top: 1.3rem;
  color: #d6e4f3;
  font-size: 1.1rem;
  line-height: 1.78;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.hero-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.25rem;
}

.hero-meta div {
  padding-top: 1rem;
  border-top: 1px solid rgba(196, 221, 250, 0.12);
}

.hero-meta dt {
  color: #8fa7c3;
  font-size: 0.74rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-meta dd {
  margin: 0.4rem 0 0;
  color: #f1f6fd;
}

.hero-visual {
  position: relative;
  min-height: 720px;
  display: grid;
  place-items: center;
}

.hero-frame,
.hero-callout,
.feature-panel,
.workflow-step,
.skill-panel,
.release-link,
.faq-item {
  background: rgba(10, 18, 31, 0.72);
  border: 1px solid rgba(163, 205, 255, 0.12);
  box-shadow: 0 30px 80px rgba(2, 6, 18, 0.46);
  backdrop-filter: blur(18px);
}

.hero-frame {
  width: min(780px, 100%);
  border-radius: 28px;
  overflow: hidden;
  transform: perspective(1700px) rotateY(-9deg) rotateX(6deg);
}

.frame-top,
.frame-tabs,
.frame-status {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.frame-top {
  justify-content: space-between;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.frame-dots {
  display: inline-flex;
  gap: 0.45rem;
}

.dot {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 50%;
}

.dot.red { background: #ff7c73; }
.dot.amber { background: #f5c767; }
.dot.green { background: #69dd9d; }

.frame-title,
.frame-pill,
.frame-sidebar span,
.frame-tabs span,
.editor-code,
.frame-status span {
  font-family: "SFMono-Regular", "Menlo", monospace;
  font-size: 0.83rem;
}

.frame-title,
.frame-tabs .is-active,
.frame-status span:last-child {
  color: #f4f8ff;
}

.frame-pill {
  padding: 0.32rem 0.75rem;
  border-radius: 999px;
  background: rgba(115, 198, 255, 0.12);
  color: #8ddcff;
}

.frame-body {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 520px;
}

.frame-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.15rem 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
}

.frame-label {
  color: #f2c57c !important;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.72rem !important;
}

.frame-spacer {
  height: 10px;
}

.frame-editor {
  display: flex;
  flex-direction: column;
}

.frame-tabs,
.frame-status {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.editor-code {
  flex: 1;
  margin: 0;
  padding: 1.35rem;
  overflow: auto;
  line-height: 1.76;
  color: #daf3ff;
}

.frame-status {
  border-bottom: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.hero-callout {
  position: absolute;
  max-width: 240px;
  padding: 1rem 1.05rem;
  border-radius: 18px;
}

.hero-callout strong {
  display: block;
  margin: 0.35rem 0 0.45rem;
}

.hero-callout p {
  margin: 0;
  color: #a8b9cd;
  line-height: 1.55;
}

.hero-callout-top {
  top: 11%;
  left: -2%;
}

.hero-callout-bottom {
  right: -2%;
  bottom: 10%;
}

.proof-strip {
  padding: 0 0 1rem;
}

.proof-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.proof-item {
  padding-top: 1rem;
  border-top: 1px solid rgba(192, 219, 252, 0.12);
}

.proof-value {
  display: block;
  color: #f1f6fd;
  font-size: 1.55rem;
  font-weight: 700;
}

.section-shell {
  padding: 2rem 0;
}

.section-contrast {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
}

.section-container {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.section-head {
  max-width: 780px;
}

.section-head.compact {
  max-width: 560px;
}

.section-head h2 {
  font-size: clamp(2.5rem, 5vw, 4.8rem);
  max-width: 12ch;
}

.section-copy {
  margin-top: 1rem;
  max-width: 58ch;
  line-height: 1.78;
}

.feature-layout {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1fr;
  gap: 1rem;
  margin-top: 2.4rem;
}

.feature-panel,
.skill-panel,
.workflow-step,
.faq-item,
.release-link {
  border-radius: 24px;
  padding: 1.5rem;
}

.feature-panel-primary {
  grid-row: span 2;
}

.feature-panel h3,
.workflow-step h3,
.skill-panel h3,
.faq-item h3 {
  margin: 0.55rem 0 0.8rem;
  font-size: 1.45rem;
}

.workflow-grid,
.skills-grid,
.faq-list {
  display: grid;
  gap: 1rem;
  margin-top: 2.4rem;
}

.workflow-step {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 1rem;
}

.workflow-index {
  color: #8de0ff;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.skills-grid,
.faq-list {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.release-layout {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 420px);
  gap: 2rem;
  align-items: start;
}

.release-stack {
  display: grid;
  gap: 1rem;
}

.release-link {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  text-decoration: none;
  color: inherit;
}

.release-link strong {
  color: #f1f6fd;
  word-break: break-all;
}

.release-link:hover {
  border-color: rgba(141, 224, 255, 0.26);
  transform: translateY(-1px);
}

.final-cta {
  padding: 3rem 0 5rem;
}

.final-cta-inner {
  padding: 2.5rem 0;
  border-top: 1px solid rgba(196, 221, 250, 0.12);
}

.final-cta h2 {
  max-width: 13ch;
  font-size: clamp(2.6rem, 5vw, 5rem);
  margin-top: 0.5rem;
}

@media (prefers-reduced-motion: no-preference) {
  .hero-frame,
  .hero-callout,
  .feature-panel,
  .workflow-step,
  .skill-panel,
  .release-link,
  .faq-item {
    transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
  }

  .feature-panel:hover,
  .workflow-step:hover,
  .skill-panel:hover,
  .faq-item:hover {
    transform: translateY(-2px);
    border-color: rgba(141, 224, 255, 0.24);
  }
}

@media (max-width: 1180px) {
  .hero-layout,
  .release-layout,
  .feature-layout {
    grid-template-columns: 1fr;
  }

  .hero-frame {
    transform: none;
  }

  .hero-callout {
    position: static;
    max-width: none;
    margin-top: 1rem;
  }

  .hero-visual {
    min-height: auto;
  }

  .feature-panel-primary {
    grid-row: auto;
  }
}

@media (max-width: 960px) {
  .proof-grid,
  .skills-grid,
  .faq-list,
  .hero-meta {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .frame-body,
  .skills-grid,
  .faq-list,
  .proof-grid,
  .hero-meta,
  .workflow-step {
    grid-template-columns: 1fr;
  }

  .frame-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .hero-layout {
    padding-top: 4.5rem;
  }

  .hero-title {
    font-size: clamp(3rem, 15vw, 4.6rem);
  }
}
</style>
