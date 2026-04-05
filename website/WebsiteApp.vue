<template>
  <v-app class="aurora-site">
    <div class="site-background"></div>

    <v-app-bar flat color="transparent" class="site-bar px-2 px-sm-4">
      <div class="brand">
        <div class="brand-mark">A</div>
        <div class="brand-copy">
          <strong>AuroraPad</strong>
          <span>Desktop editor for builders</span>
        </div>
      </div>

      <v-spacer />

      <div class="nav-links d-none d-md-flex">
        <a href="#features">Features</a>
        <a href="#workflow">Workflow</a>
        <a href="#skills">Skills</a>
        <a href="#links">Links</a>
      </div>
    </v-app-bar>

    <v-main>
      <section class="hero-shell">
        <v-container class="py-10 py-md-16">
          <v-row align="center" class="hero-grid">
            <v-col cols="12" lg="5">
              <div class="hero-copy">
                <v-chip color="accent" variant="tonal" class="mb-4 text-uppercase tracking">
                  New built-in skills for developer workflows
                </v-chip>
                <p class="eyebrow mb-3">Monaco power. Desktop focus. Zero wasted motion.</p>
                <h1 class="hero-title">
                  A modern tool website for an editor that keeps the work moving.
                </h1>
                <p class="hero-body">
                  AuroraPad combines Notepad++ familiarity with Monaco editing, workspace search,
                  command palette flows, plugin skills, and terminal sessions in one tight desktop
                  experience.
                </p>

                <div class="hero-actions">
                  <v-btn color="primary" size="x-large" :href="downloadUrl" target="_blank" rel="noreferrer">
                    Download AuroraPad
                  </v-btn>
                  <v-btn variant="outlined" size="x-large" :href="repoUrl" target="_blank" rel="noreferrer">
                    View Repository
                  </v-btn>
                </div>

                <div class="hero-links">
                  <div>
                    <span class="hero-links-label">Repo URL</span>
                    <a :href="repoUrl" target="_blank" rel="noreferrer">{{ repoUrl }}</a>
                  </div>
                  <div>
                    <span class="hero-links-label">Download URL</span>
                    <a :href="downloadUrl" target="_blank" rel="noreferrer">{{ downloadUrl }}</a>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" lg="7">
              <div class="hero-stage">
                <div class="hero-orb orb-a"></div>
                <div class="hero-orb orb-b"></div>

                <v-card class="editor-showcase" elevation="0">
                  <div class="showcase-topbar">
                    <div class="topbar-dots">
                      <span class="dot red"></span>
                      <span class="dot amber"></span>
                      <span class="dot green"></span>
                    </div>
                    <span class="window-title">AuroraPad.app</span>
                    <v-chip size="small" variant="tonal">Aurora Dark</v-chip>
                  </div>

                  <div class="showcase-toolbar">
                    <span>File</span>
                    <span>Edit</span>
                    <span>Search</span>
                    <span>Plugins</span>
                    <span>Terminal</span>
                  </div>

                  <div class="showcase-body">
                    <aside class="showcase-sidebar">
                      <div class="sidebar-group">
                        <span class="sidebar-label">Workspace</span>
                        <span>src/</span>
                        <span>components/</span>
                        <span>plugins/</span>
                        <span>website/</span>
                      </div>
                      <div class="sidebar-group">
                        <span class="sidebar-label">Recent</span>
                        <span>App.vue</span>
                        <span>FindInFiles.vue</span>
                        <span>WebsiteApp.vue</span>
                      </div>
                    </aside>

                    <div class="showcase-editor">
                      <div class="editor-tabs">
                        <span class="is-active">aurorapad.config.ts</span>
                        <span>plugin-api.js</span>
                        <span>README.md</span>
                      </div>
                      <pre class="editor-code"><code>const aurora = {
  stack: ['Electron', 'Vue', 'Monaco'],
  workflow: ['search', 'tabs', 'plugins', 'terminal'],
  feel: 'familiar desktop confidence',
}

launch({
  sessionRestore: true,
  commandPalette: true,
  workspaceSearch: true,
  builtInSkills: ['developer-tools', 'text-tools'],
})</code></pre>
                      <div class="showcase-status">
                        <span>TypeScript</span>
                        <span>Ln 12, Col 4</span>
                        <span>UTF-8</span>
                        <span>Ready</span>
                      </div>
                    </div>
                  </div>
                </v-card>

                <v-card class="floating-note note-top" elevation="0">
                  <span class="floating-label">Workspace Search</span>
                  <strong>Find across the project</strong>
                  <p>Search the full folder and jump straight into the result.</p>
                </v-card>

                <v-card class="floating-note note-bottom" elevation="0">
                  <span class="floating-label">Terminal Dock</span>
                  <strong>Run inside context</strong>
                  <p>Open a shell from the same workspace and keep momentum intact.</p>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section class="signal-section">
        <v-container>
          <div class="signal-strip">
            <span>Notepad++-style chrome</span>
            <span>Monaco editing engine</span>
            <span>Workspace search</span>
            <span>Plugin skill system</span>
            <span>Integrated terminal</span>
          </div>
        </v-container>
      </section>

      <section id="features" class="content-section">
        <v-container class="py-14 py-md-16">
          <div class="section-heading">
            <p class="eyebrow mb-3">Features</p>
            <h2>Everything you need to explain AuroraPad as a serious modern tool.</h2>
          </div>

          <v-row class="mt-8" dense>
            <v-col cols="12" md="6" lg="5">
              <v-card class="feature-card feature-card-large" elevation="0">
                <span class="feature-kicker">Core editing</span>
                <h3>Compact interface, deep capability.</h3>
                <p>
                  Multi-tab editing, bookmarks, language switching, find and replace, file tree
                  navigation, and session restore all sit inside one clean desktop shell.
                </p>
                <ul>
                  <li>Syntax support across major languages</li>
                  <li>Command palette and project-wide search</li>
                  <li>Status-aware editing with encoding and EOL context</li>
                </ul>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" lg="7">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-card class="feature-card" elevation="0">
                    <span class="feature-kicker">Workflow</span>
                    <h3>Search, command, act.</h3>
                    <p>
                      Move from tabs to command palette to terminal without falling out of flow.
                    </p>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card class="feature-card" elevation="0">
                    <span class="feature-kicker">Plugins</span>
                    <h3>Extend cleanly.</h3>
                    <p>
                      Add JavaScript plugins and expose custom actions through the same menu system.
                    </p>
                  </v-card>
                </v-col>
                <v-col cols="12">
                  <v-card class="feature-card feature-band" elevation="0">
                    <span class="feature-kicker">Positioning</span>
                    <h3>Familiar enough to trust, modern enough to feel like an upgrade.</h3>
                    <p>
                      That balance is AuroraPad’s strongest pitch. The UI lowers adoption friction
                      while the workflow features make it feel meaningfully more capable.
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section id="workflow" class="content-section alt-section">
        <v-container class="py-14 py-md-16">
          <v-row align="start">
            <v-col cols="12" lg="4">
              <div class="section-heading">
                <p class="eyebrow mb-3">Workflow</p>
                <h2>One window, one rhythm, fewer interruptions.</h2>
                <p class="section-copy">
                  Open a folder, jump across files, search the workspace, trigger a skill, and run a
                  command from the same place. AuroraPad is strongest when the day’s little delays
                  disappear.
                </p>
              </div>
            </v-col>
            <v-col cols="12" lg="8">
              <div class="workflow-stack">
                <v-card
                  v-for="(step, index) in workflowSteps"
                  :key="step.title"
                  class="workflow-card"
                  elevation="0"
                >
                  <span class="workflow-index">{{ String(index + 1).padStart(2, '0') }}</span>
                  <div>
                    <h3>{{ step.title }}</h3>
                    <p>{{ step.body }}</p>
                  </div>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section id="skills" class="content-section">
        <v-container class="py-14 py-md-16">
          <div class="section-heading">
            <p class="eyebrow mb-3">Built-in skills</p>
            <h2>Useful on day one, extensible after that.</h2>
          </div>

          <v-row class="mt-8" dense>
            <v-col v-for="skill in skills" :key="skill.title" cols="12" md="4">
              <v-card class="skill-card" elevation="0">
                <span class="feature-kicker">{{ skill.kicker }}</span>
                <h3>{{ skill.title }}</h3>
                <p>{{ skill.body }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section id="links" class="content-section">
        <v-container class="py-14 py-md-16">
          <v-card class="links-panel" elevation="0">
            <v-row align="center">
              <v-col cols="12" lg="7">
                <p class="eyebrow mb-3">Links</p>
                <h2>Everything someone needs to try AuroraPad or inspect the project.</h2>
                <p class="section-copy">
                  Use the repository for source, issues, and roadmap. Use the download page for
                  packaged builds and release updates.
                </p>
              </v-col>
              <v-col cols="12" lg="5">
                <div class="link-stack">
                  <v-card class="link-card" elevation="0" :href="repoUrl" target="_blank" rel="noreferrer">
                    <div>
                      <span class="feature-kicker">Repository</span>
                      <strong>{{ repoUrl }}</strong>
                    </div>
                    <v-icon icon="mdi-open-in-new" />
                  </v-card>
                  <v-card class="link-card" elevation="0" :href="downloadUrl" target="_blank" rel="noreferrer">
                    <div>
                      <span class="feature-kicker">Download URL</span>
                      <strong>{{ downloadUrl }}</strong>
                    </div>
                    <v-icon icon="mdi-download" />
                  </v-card>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-container>
      </section>
    </v-main>
  </v-app>
</template>

<script setup>
const repoUrl = 'https://github.com/ali111887/AuroraPad'
const downloadUrl = 'https://github.com/ali111887/AuroraPad/releases'

const workflowSteps = [
  {
    title: 'Open the workspace',
    body: 'Load a folder, restore a session, and get your files back into view without setup overhead.',
  },
  {
    title: 'Navigate with intent',
    body: 'Use the command palette, tabs, and workspace search instead of digging through UI.',
  },
  {
    title: 'Edit without drift',
    body: 'Stay in the same editor while Monaco handles language support, search, and code ergonomics.',
  },
  {
    title: 'Run in context',
    body: 'Open the terminal dock or run commands from the active project path instead of leaving the app.',
  },
]

const skills = [
  {
    kicker: 'Developer Tools',
    title: 'Format and transform data fast',
    body: 'Pretty-print JSON, minify payloads, and encode or decode URL and Base64 text.',
  },
  {
    kicker: 'Text Tools',
    title: 'Clean up content in place',
    body: 'Convert to title case, slugify selections, and inspect text statistics instantly.',
  },
  {
    kicker: 'Plugin System',
    title: 'Add your own capabilities',
    body: 'Drop JavaScript plugins into the user folder and surface custom actions inside AuroraPad.',
  },
]
</script>

<style>
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #060d18;
}

.aurora-site {
  color: #edf5ff;
  background:
    radial-gradient(circle at top left, rgba(95, 174, 255, 0.18), transparent 28%),
    radial-gradient(circle at 88% 14%, rgba(116, 230, 255, 0.16), transparent 24%),
    linear-gradient(180deg, #0b1730 0%, #060d18 42%, #040912 100%);
}

.site-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.74), transparent 92%);
}

.site-bar {
  backdrop-filter: blur(18px);
  background: rgba(4, 9, 18, 0.58) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #74e6ff, #5faeff);
  color: #04101d;
  font-family: "Iowan Old Style", "Georgia", serif;
  font-size: 1.45rem;
  font-weight: 700;
  box-shadow: 0 14px 34px rgba(95, 174, 255, 0.32);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-copy strong {
  letter-spacing: 0.04em;
}

.brand-copy span,
.nav-links a,
.hero-body,
.hero-links a,
.hero-links-label,
.section-copy,
.feature-card p,
.workflow-card p,
.skill-card p,
.link-card strong,
.showcase-toolbar span,
.showcase-sidebar span,
.showcase-status span,
.editor-tabs span {
  color: #9db4ce;
}

.nav-links {
  gap: 1.2rem;
}

.nav-links a {
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #edf5ff;
}

.tracking,
.eyebrow,
.feature-kicker,
.floating-label,
.sidebar-label,
.hero-links-label,
.workflow-index {
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.74rem;
}

.eyebrow,
.feature-kicker,
.floating-label,
.sidebar-label,
.hero-links-label,
.workflow-index {
  color: #f4c98d;
}

.hero-shell {
  position: relative;
}

.hero-grid {
  min-height: calc(100vh - 64px);
}

.hero-title,
.section-heading h2 {
  font-family: "Iowan Old Style", "Georgia", serif;
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.94;
}

.hero-title {
  margin: 0;
  font-size: clamp(3.25rem, 7vw, 6.9rem);
  max-width: 9ch;
}

.hero-body {
  margin-top: 1.2rem;
  max-width: 56ch;
  font-size: 1.05rem;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.hero-links {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
}

.hero-links div {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-links a {
  display: inline-block;
  margin-top: 0.35rem;
  word-break: break-all;
}

.hero-stage {
  position: relative;
  min-height: 720px;
  display: grid;
  place-items: center;
}

.hero-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(14px);
}

.orb-a {
  top: 8%;
  left: 5%;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(116, 230, 255, 0.3), transparent 70%);
}

.orb-b {
  right: 4%;
  bottom: 8%;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(95, 174, 255, 0.24), transparent 72%);
}

.editor-showcase,
.floating-note,
.feature-card,
.workflow-card,
.skill-card,
.links-panel,
.link-card {
  border: 1px solid rgba(151, 193, 255, 0.14) !important;
  background: rgba(9, 20, 38, 0.72) !important;
  box-shadow: 0 30px 90px rgba(2, 8, 20, 0.48) !important;
  backdrop-filter: blur(16px);
}

.editor-showcase {
  position: relative;
  z-index: 2;
  width: min(780px, 100%);
  overflow: hidden;
  transform: perspective(1600px) rotateY(-10deg) rotateX(7deg);
}

.showcase-topbar,
.showcase-toolbar,
.editor-tabs,
.showcase-status {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
}

.showcase-topbar,
.showcase-toolbar,
.editor-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.topbar-dots {
  display: inline-flex;
  gap: 0.45rem;
}

.dot {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 50%;
}

.dot.red { background: #ff6f61; }
.dot.amber { background: #ffc857; }
.dot.green { background: #45da9a; }

.window-title,
.showcase-toolbar span,
.showcase-sidebar span,
.editor-tabs span,
.editor-code,
.showcase-status span {
  font-family: "SFMono-Regular", "Menlo", monospace;
  font-size: 0.83rem;
}

.window-title,
.editor-tabs .is-active,
.showcase-status span:last-child {
  color: #edf5ff;
}

.showcase-body {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 500px;
}

.showcase-sidebar {
  padding: 1.2rem 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.4rem;
}

.showcase-editor {
  display: flex;
  flex-direction: column;
}

.editor-code {
  margin: 0;
  padding: 1.25rem;
  flex: 1;
  overflow: auto;
  color: #dff5ff;
  line-height: 1.74;
}

.floating-note {
  position: absolute;
  z-index: 3;
  max-width: 230px;
  padding: 1rem 1.1rem;
}

.floating-note strong {
  display: block;
  margin: 0.3rem 0 0.45rem;
  font-size: 1.1rem;
}

.floating-note p {
  margin: 0;
  color: #9db4ce;
  line-height: 1.55;
}

.note-top {
  top: 14%;
  left: -1%;
}

.note-bottom {
  right: -2%;
  bottom: 12%;
}

.signal-section {
  padding-bottom: 1rem;
}

.signal-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;
}

.signal-strip span {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  color: #9db4ce;
}

.content-section {
  position: relative;
}

.alt-section {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0));
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(2.35rem, 5vw, 4.5rem);
  max-width: 12ch;
}

.feature-card,
.workflow-card,
.skill-card {
  height: 100%;
  padding: 1.5rem;
}

.feature-card-large {
  min-height: 100%;
}

.feature-card h3,
.workflow-card h3,
.skill-card h3 {
  margin: 0.45rem 0 0.8rem;
  font-size: 1.45rem;
}

.feature-card ul {
  margin: 1rem 0 0;
  padding-left: 1rem;
  color: #9db4ce;
  line-height: 1.85;
}

.feature-band {
  min-height: 100%;
}

.workflow-stack {
  display: grid;
  gap: 1rem;
}

.workflow-card {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 1rem;
}

.workflow-index {
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  color: #74e6ff;
  font-size: 1rem;
  font-weight: 700;
}

.links-panel {
  padding: 2rem;
}

.link-stack {
  display: grid;
  gap: 1rem;
}

.link-card {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  text-decoration: none;
}

.link-card strong {
  display: block;
  margin-top: 0.35rem;
  line-height: 1.5;
  word-break: break-all;
}

@media (max-width: 1180px) {
  .editor-showcase {
    transform: none;
  }

  .floating-note {
    position: static;
    max-width: none;
    margin-top: 1rem;
  }

  .hero-stage {
    min-height: auto;
  }
}

@media (max-width: 960px) {
  .signal-strip {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .showcase-body {
    grid-template-columns: 1fr;
  }

  .showcase-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .signal-strip,
  .workflow-card {
    grid-template-columns: 1fr;
  }
}
</style>
