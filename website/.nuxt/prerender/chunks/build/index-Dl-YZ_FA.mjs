import { ssrRenderComponent, ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue/server-renderer/index.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-DLMGPo7Y.mjs';
import { mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue/index.mjs';
import { a as appIcon } from './aurorapad-app-icon-CAhyaE2D.mjs';
import { _ as _export_sfc } from './server.mjs';
import { u as useSeoMeta } from './composables-C1GJy1oh.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/ufo/dist/index.mjs';
import '../_/renderer.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/h3/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/destr/dist/index.mjs';
import '../nitro/nitro.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/nitropack/node_modules/hookable/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/ofetch/dist/node.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/node-mock-http/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unstorage/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unstorage/drivers/fs.mjs';
import 'node:crypto';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unstorage/drivers/lru-cache.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/ohash/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/klona/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/defu/dist/defu.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/scule/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unctx/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/radix3/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/pathe/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unhead/dist/server.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/devalue/index.js';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unhead/dist/plugins.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/unhead/dist/utils.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/hookable/dist/index.mjs';

const repoUrl = "https://github.com/ali111887/AuroraPad";
const downloadUrl = "https://github.com/ali111887/AuroraPad/releases";
const _sfc_main$1 = {
  __name: "WebsiteApp",
  __ssrInlineRender: true,
  setup(__props) {
    const heroMeta = [
      { label: "Platforms", value: "Windows, macOS, Linux" },
      { label: "Core stack", value: "Electron, Vue, Monaco" },
      { label: "Release flow", value: "Tagged builds with CI" }
    ];
    const editorLines = [
      "release:",
      "  semanticVersioning: automatic",
      "  tags: generated-by-ci",
      "  binaries:",
      "    windows: ready",
      "    macos: ready",
      "    linux: ready",
      "",
      "workspace:",
      "  search: enabled",
      "  terminalDock: integrated",
      "  builtInSkills:",
      "    - developer-tools",
      "    - text-tools",
      "    - selection-tools"
    ];
    const proofItems = [
      "Monaco editing",
      "Workspace search",
      "Command palette",
      "Integrated terminal",
      "Built-in skills",
      "Cross-platform packaging"
    ];
    const pillars = [
      {
        kicker: "Focused",
        title: "Fast enough for everyday editing without feeling stripped down.",
        body: "AuroraPad is designed to keep opening, searching, editing, and saving feeling immediate instead of heavy."
      },
      {
        kicker: "Project-aware",
        title: "Structured for repository work, not just single files.",
        body: "Project search, session restore, terminal context, release automation, and persistent preferences extend it beyond a simple text editor."
      },
      {
        kicker: "Extensible",
        title: "Open to plugin skills and workflow shaping.",
        body: "Built-in tools and JavaScript plugins make it practical to adapt AuroraPad to the way you like to work."
      }
    ];
    const features = [
      {
        index: "01",
        kicker: "Editor core",
        title: "Monaco editing with desktop-native controls.",
        body: "Language-aware editing, minimap, wrapping, whitespace visibility, bookmarks, split view, font controls, and session persistence are built into the workspace."
      },
      {
        index: "02",
        kicker: "Workspace flow",
        title: "Navigation and search built around repositories.",
        body: "Open a folder, move through the tree, jump with the command palette, and search across the project without leaving the editor rhythm."
      },
      {
        index: "03",
        kicker: "Terminal context",
        title: "Integrated terminals that respect the active project.",
        body: "Terminal sessions open in context, expose available shell profiles, and keep command execution close to the files you are editing."
      },
      {
        index: "04",
        kicker: "Shipping path",
        title: "Release management is part of the product story.",
        body: "AuroraPad ships with semantic versioning, GitHub release automation, and platform-specific build generation for Windows, macOS, and Linux."
      }
    ];
    const showcaseCards = [
      {
        kicker: "Command flow",
        title: "A command palette that behaves like a workspace launcher.",
        body: "Jump to files, actions, and editor controls from one place instead of hunting through menus.",
        mockupTitle: "Command Palette",
        mockupMeta: "Cmd/Ctrl + P",
        className: "showcase-card--wide",
        lines: ["> open release.yml", "> toggle sidebar", "> find in files", "> open plugins manager"]
      },
      {
        kicker: "Built-in skills",
        title: "Useful tools are there immediately, not buried behind setup.",
        body: "Text transforms, developer helpers, and selection tools make the editor practical from the first run.",
        mockupTitle: "Built-in Skills",
        mockupMeta: "ready",
        className: "showcase-card--accent",
        lines: ["developer-tools", "text-tools", "selection-tools", "plugin-ready architecture"]
      },
      {
        kicker: "Terminal dock",
        title: "Run commands where the project already lives.",
        body: "Keep shell work in-context with visible profiles, active sessions, and cleaner terminal handoff.",
        mockupTitle: "Terminal Dock",
        mockupMeta: "project-aware",
        className: "",
        lines: ["$ npm run build", "$ npm run electron:dev", "zsh \u2022 powershell \u2022 bash", "session state: ready"]
      }
    ];
    const manifestoPoints = [
      {
        title: "Desktop-first polish",
        body: "The interface is tuned like a real desktop app rather than a browser view wrapped in Electron."
      },
      {
        title: "Workflow over feature clutter",
        body: "The goal is a better editing loop, not a bloated panel maze."
      },
      {
        title: "Open-source transparency",
        body: "The repository, release flow, website, and product direction are visible and hackable in one place."
      }
    ];
    const comparisonItems = [
      {
        kicker: "Lighter than an IDE",
        title: "Open quickly and stay focused on editing.",
        body: "AuroraPad is aimed at people who want project capability without carrying the visual and mental weight of a heavyweight IDE all day."
      },
      {
        kicker: "Richer than a scratch editor",
        title: "Keep project search, terminal context, and release awareness close.",
        body: "It is built for repositories, not just loose files, so the surrounding workflow feels intentional instead of bolted on."
      },
      {
        kicker: "More product-minded",
        title: "Ship, explain, and iterate from the same repository.",
        body: "The app, release flow, and website all live together, which makes AuroraPad easier to evolve as an actual software product."
      }
    ];
    const downloads = [
      {
        kicker: "Windows",
        title: "Installer and portable builds",
        body: "Grab packaged Windows releases directly from GitHub release assets."
      },
      {
        kicker: "macOS",
        title: "Native Apple Silicon packages",
        body: "Download signed-style release artifacts built for a smoother desktop install flow."
      },
      {
        kicker: "Linux",
        title: "AppImage and archive output",
        body: "Run AuroraPad on Linux without turning the project into a complex setup task."
      }
    ];
    const artifactRows = [
      {
        platform: "Windows",
        assets: "Setup executable, portable executable, latest metadata",
        useCase: "Best for standard installs or carrying AuroraPad as a portable utility."
      },
      {
        platform: "macOS",
        assets: "DMG package, ZIP archive, update metadata",
        useCase: "Best for direct desktop installs on Apple Silicon systems."
      },
      {
        platform: "Linux",
        assets: "AppImage, tar.gz archive, release metadata",
        useCase: "Best for quick runs or keeping AuroraPad inside custom developer environments."
      }
    ];
    const releaseSteps = [
      {
        index: "01",
        title: "Version resolves from repository history",
        body: "CI computes the next semantic version and tags the release so builds stay consistent with the project timeline."
      },
      {
        index: "02",
        title: "Cross-platform artifacts are generated",
        body: "Windows, macOS, and Linux packages are built in automation so downloads are ready for real users, not just developers."
      },
      {
        index: "03",
        title: "GitHub release becomes the download source",
        body: "Packaged binaries are attached to the release, and the website points users toward those intended assets first."
      }
    ];
    const projectItems = [
      {
        kicker: "App",
        title: "Desktop editor",
        body: "The main AuroraPad application is built with Vue, Electron, and Monaco, with persistent preferences and workflow-focused tooling."
      },
      {
        kicker: "CI",
        title: "Semantic releases",
        body: "Versioning, tags, and packaged binaries are driven by automation so releases stay reproducible and easier to reason about."
      },
      {
        kicker: "Web",
        title: "Product website in the same repo",
        body: "The marketing site lives inside the project so the product story stays aligned with the actual app and release state."
      }
    ];
    const faqItems = [
      {
        q: "Is AuroraPad meant to replace a full IDE?",
        a: "It is designed more as a fast, capable desktop editor for focused project work. The goal is to stay lighter than a full IDE while covering the workflow depth many lightweight editors miss."
      },
      {
        q: "Can I inspect or modify the project myself?",
        a: "Yes. AuroraPad is open source, and the repository includes the desktop app, release workflow, and website in one place."
      },
      {
        q: "How do downloads work?",
        a: "The intended downloads are the packaged binaries attached to GitHub Releases for Windows, macOS, and Linux."
      }
    ];
    const finalOptions = [
      {
        title: "Download a build",
        body: "Start with the latest packaged release for your platform."
      },
      {
        title: "Inspect the repo",
        body: "Review the code, workflow, and release setup directly on GitHub."
      },
      {
        title: "Adapt the workflow",
        body: "Use built-in skills, plugins, and project tooling to shape AuroraPad around your own routine."
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "aurora-site" }, _attrs))} data-v-27673711><div class="site-bg" aria-hidden="true" data-v-27673711><span class="orb orb-blue" data-v-27673711></span><span class="orb orb-teal" data-v-27673711></span><span class="orb orb-violet" data-v-27673711></span><span class="mesh" data-v-27673711></span></div><header class="site-header" data-v-27673711><div class="site-header__inner" data-v-27673711><a href="#top" class="brand" aria-label="AuroraPad home" data-v-27673711><img class="brand__icon"${ssrRenderAttr("src", unref(appIcon))} alt="" data-v-27673711><span class="brand__copy" data-v-27673711><strong data-v-27673711>AuroraPad</strong><small data-v-27673711>Desktop editor</small></span></a><nav class="site-nav site-nav--desktop" aria-label="Primary" data-v-27673711><a href="#why" data-v-27673711>Why</a><a href="#workspace" data-v-27673711>Workspace</a><a href="#showcase" data-v-27673711>Showcase</a><a href="#releases" data-v-27673711>Releases</a><a href="#faq" data-v-27673711>FAQ</a></nav><div class="site-header__actions" data-v-27673711><a class="site-btn site-btn--ghost"${ssrRenderAttr("href", repoUrl)} target="_blank" rel="noreferrer" data-v-27673711>Repository</a><a class="site-btn site-btn--primary"${ssrRenderAttr("href", downloadUrl)} target="_blank" rel="noreferrer" data-v-27673711>Download</a></div></div></header><main data-v-27673711><section id="top" class="hero" data-v-27673711><div class="hero__inner" data-v-27673711><div class="hero__copy" data-v-27673711><p class="eyebrow" data-v-27673711>Modern desktop editing for real project work</p><h1 data-v-27673711>One focused editor for code, search, terminal flow, and release-ready shipping.</h1><p class="hero__body" data-v-27673711> AuroraPad brings Monaco editing, project navigation, built-in skills, integrated terminal sessions, and packaged cross-platform releases into a faster, cleaner desktop experience. </p><div class="hero__actions" data-v-27673711><a class="site-btn site-btn--primary site-btn--large"${ssrRenderAttr("href", downloadUrl)} target="_blank" rel="noreferrer" data-v-27673711> Download Latest Release </a><a class="site-btn site-btn--outline site-btn--large"${ssrRenderAttr("href", repoUrl)} target="_blank" rel="noreferrer" data-v-27673711> View Repository </a></div><div class="hero__meta" data-v-27673711><!--[-->`);
      ssrRenderList(heroMeta, (item) => {
        _push(`<div class="hero__meta-item" data-v-27673711><span data-v-27673711>${ssrInterpolate(item.label)}</span><strong data-v-27673711>${ssrInterpolate(item.value)}</strong></div>`);
      });
      _push(`<!--]--></div></div><div class="hero__visual" data-v-27673711><div class="product-window" data-v-27673711><div class="product-window__top" data-v-27673711><div class="traffic" data-v-27673711><span data-v-27673711></span><span data-v-27673711></span><span data-v-27673711></span></div><div class="product-window__title" data-v-27673711>AuroraPad Workspace</div><div class="product-window__badge" data-v-27673711>v0.1.x builds</div></div><div class="product-window__body" data-v-27673711><aside class="workspace-sidebar" data-v-27673711><div class="workspace-sidebar__section" data-v-27673711><span class="workspace-label" data-v-27673711>Project</span><span data-v-27673711>src/</span><span data-v-27673711>components/</span><span data-v-27673711>plugins/</span><span data-v-27673711>website/</span></div><div class="workspace-sidebar__section" data-v-27673711><span class="workspace-label" data-v-27673711>Recent</span><span data-v-27673711>App.vue</span><span data-v-27673711>TerminalDock.vue</span><span data-v-27673711>release.yml</span></div></aside><div class="workspace-editor" data-v-27673711><div class="workspace-tabs" data-v-27673711><span class="is-active" data-v-27673711>release.yml</span><span data-v-27673711>settings.js</span><span data-v-27673711>WebsiteApp.vue</span></div><div class="workspace-code" data-v-27673711><!--[-->`);
      ssrRenderList(editorLines, (line) => {
        _push(`<div class="workspace-code__line" data-v-27673711>${ssrInterpolate(line)}</div>`);
      });
      _push(`<!--]--></div><div class="workspace-terminal" data-v-27673711><div class="workspace-terminal__head" data-v-27673711><span data-v-27673711>Integrated Terminal</span><span data-v-27673711>zsh \u2022 project root</span></div><div class="workspace-terminal__body" data-v-27673711><span data-v-27673711>$ npm run build</span><span data-v-27673711>\u2713 app ready</span><span data-v-27673711>\u2713 website ready</span><span data-v-27673711>\u2713 release assets packaged</span></div></div></div></div></div><div class="floating-note floating-note--left" data-v-27673711><span class="eyebrow" data-v-27673711>Search</span><strong data-v-27673711>Whole-project search, not file-only editing</strong></div><div class="floating-note floating-note--right" data-v-27673711><span class="eyebrow" data-v-27673711>Release</span><strong data-v-27673711>Ship tagged builds for Windows, macOS, and Linux</strong></div></div></div></section><section class="proof-strip" aria-label="Product proof" data-v-27673711><div class="proof-strip__inner" data-v-27673711><!--[-->`);
      ssrRenderList(proofItems, (item) => {
        _push(`<span data-v-27673711>${ssrInterpolate(item)}</span>`);
      });
      _push(`<!--]--></div></section><section id="why" class="section section--editorial" data-v-27673711><div class="section-head" data-v-27673711><p class="eyebrow" data-v-27673711>Why AuroraPad</p><h2 data-v-27673711>Built for developers who want a sharper desktop editor without losing project depth.</h2></div><div class="editorial-columns" data-v-27673711><!--[-->`);
      ssrRenderList(pillars, (item) => {
        _push(`<article class="editorial-column" data-v-27673711><span class="eyebrow" data-v-27673711>${ssrInterpolate(item.kicker)}</span><h3 data-v-27673711>${ssrInterpolate(item.title)}</h3><p data-v-27673711>${ssrInterpolate(item.body)}</p></article>`);
      });
      _push(`<!--]--></div></section><section id="workspace" class="section workspace-story" data-v-27673711><div class="workspace-story__grid" data-v-27673711><div class="workspace-story__intro" data-v-27673711><p class="eyebrow" data-v-27673711>Workspace</p><h2 data-v-27673711>Editing, navigation, terminal context, and commands in one calm desktop surface.</h2><p data-v-27673711> AuroraPad is shaped around the real loop of opening a repo, moving through files, searching across the project, making changes, and running commands without breaking flow. </p></div><div class="workspace-story__list" data-v-27673711><!--[-->`);
      ssrRenderList(features, (feature) => {
        _push(`<article class="feature-row" data-v-27673711><div class="feature-row__index" data-v-27673711>${ssrInterpolate(feature.index)}</div><div data-v-27673711><span class="eyebrow" data-v-27673711>${ssrInterpolate(feature.kicker)}</span><h3 data-v-27673711>${ssrInterpolate(feature.title)}</h3><p data-v-27673711>${ssrInterpolate(feature.body)}</p></div></article>`);
      });
      _push(`<!--]--></div></div></section><section id="showcase" class="section showcase" data-v-27673711><div class="section-head" data-v-27673711><p class="eyebrow" data-v-27673711>Showcase</p><h2 data-v-27673711>A closer look at the moments that make AuroraPad feel like a modern desktop tool.</h2></div><div class="showcase-grid" data-v-27673711><!--[-->`);
      ssrRenderList(showcaseCards, (item) => {
        _push(`<article class="${ssrRenderClass([item.className, "showcase-card"])}" data-v-27673711><div class="showcase-card__visual" data-v-27673711><div class="showcase-mockup" data-v-27673711><div class="showcase-mockup__bar" data-v-27673711><span data-v-27673711>${ssrInterpolate(item.mockupTitle)}</span><small data-v-27673711>${ssrInterpolate(item.mockupMeta)}</small></div><div class="showcase-mockup__body" data-v-27673711><!--[-->`);
        ssrRenderList(item.lines, (line) => {
          _push(`<span data-v-27673711>${ssrInterpolate(line)}</span>`);
        });
        _push(`<!--]--></div></div></div><div class="showcase-card__copy" data-v-27673711><span class="eyebrow" data-v-27673711>${ssrInterpolate(item.kicker)}</span><h3 data-v-27673711>${ssrInterpolate(item.title)}</h3><p data-v-27673711>${ssrInterpolate(item.body)}</p></div></article>`);
      });
      _push(`<!--]--></div></section><section class="section manifesto" data-v-27673711><div class="manifesto-card" data-v-27673711><div data-v-27673711><p class="eyebrow" data-v-27673711>What Makes It Different</p><h2 data-v-27673711>More grounded than a generic editor shell, lighter than a full IDE, and packaged like a real product.</h2></div><div class="manifesto-points" data-v-27673711><!--[-->`);
      ssrRenderList(manifestoPoints, (point) => {
        _push(`<div class="manifesto-point" data-v-27673711><strong data-v-27673711>${ssrInterpolate(point.title)}</strong><p data-v-27673711>${ssrInterpolate(point.body)}</p></div>`);
      });
      _push(`<!--]--></div></div></section><section class="section compare-section" data-v-27673711><div class="section-head" data-v-27673711><p class="eyebrow" data-v-27673711>Positioning</p><h2 data-v-27673711>Made for the space between a bare text editor and a full-blown IDE.</h2></div><div class="compare-grid" data-v-27673711><!--[-->`);
      ssrRenderList(comparisonItems, (item) => {
        _push(`<article class="compare-card" data-v-27673711><span class="eyebrow" data-v-27673711>${ssrInterpolate(item.kicker)}</span><h3 data-v-27673711>${ssrInterpolate(item.title)}</h3><p data-v-27673711>${ssrInterpolate(item.body)}</p></article>`);
      });
      _push(`<!--]--></div></section><section id="releases" class="section release-section" data-v-27673711><div class="section-head" data-v-27673711><p class="eyebrow" data-v-27673711>Releases</p><h2 data-v-27673711>Clear download paths, GitHub transparency, and release automation that matches the product.</h2></div><div class="release-grid" data-v-27673711><div class="download-matrix" data-v-27673711><!--[-->`);
      ssrRenderList(downloads, (item) => {
        _push(`<a class="download-item"${ssrRenderAttr("href", downloadUrl)} target="_blank" rel="noreferrer" data-v-27673711><span class="eyebrow" data-v-27673711>${ssrInterpolate(item.kicker)}</span><strong data-v-27673711>${ssrInterpolate(item.title)}</strong><p data-v-27673711>${ssrInterpolate(item.body)}</p></a>`);
      });
      _push(`<!--]--></div><div class="release-aside" data-v-27673711><div class="release-link-group" data-v-27673711><span class="eyebrow" data-v-27673711>Repository</span><a${ssrRenderAttr("href", repoUrl)} target="_blank" rel="noreferrer" data-v-27673711>${ssrInterpolate(repoUrl)}</a></div><div class="release-link-group" data-v-27673711><span class="eyebrow" data-v-27673711>Latest Builds</span><a${ssrRenderAttr("href", downloadUrl)} target="_blank" rel="noreferrer" data-v-27673711>${ssrInterpolate(downloadUrl)}</a></div><div class="release-callout" data-v-27673711> AuroraPad publishes packaged binaries first. GitHub\u2019s auto-generated source archives still exist, but the intended experience is to download the platform-specific desktop builds. </div></div></div><div class="artifact-matrix" data-v-27673711><div class="artifact-matrix__head" data-v-27673711><span data-v-27673711>Platform</span><span data-v-27673711>Primary assets</span><span data-v-27673711>Best for</span></div><!--[-->`);
      ssrRenderList(artifactRows, (row) => {
        _push(`<div class="artifact-matrix__row" data-v-27673711><strong data-v-27673711>${ssrInterpolate(row.platform)}</strong><span data-v-27673711>${ssrInterpolate(row.assets)}</span><span data-v-27673711>${ssrInterpolate(row.useCase)}</span></div>`);
      });
      _push(`<!--]--></div><div class="release-flow" data-v-27673711><div class="release-flow__intro" data-v-27673711><p class="eyebrow" data-v-27673711>Release Flow</p><h3 data-v-27673711>From commit to tagged desktop binaries.</h3></div><div class="release-flow__steps" data-v-27673711><!--[-->`);
      ssrRenderList(releaseSteps, (step) => {
        _push(`<article class="release-step" data-v-27673711><span class="release-step__index" data-v-27673711>${ssrInterpolate(step.index)}</span><div data-v-27673711><strong data-v-27673711>${ssrInterpolate(step.title)}</strong><p data-v-27673711>${ssrInterpolate(step.body)}</p></div></article>`);
      });
      _push(`<!--]--></div></div></section><section class="section open-source" data-v-27673711><div class="open-source__grid" data-v-27673711><div class="section-head section-head--compact" data-v-27673711><p class="eyebrow" data-v-27673711>Project System</p><h2 data-v-27673711>The editor, the release flow, and the product website live in one repository.</h2></div><div class="open-source__items" data-v-27673711><!--[-->`);
      ssrRenderList(projectItems, (item) => {
        _push(`<article class="open-source__item" data-v-27673711><span class="eyebrow" data-v-27673711>${ssrInterpolate(item.kicker)}</span><h3 data-v-27673711>${ssrInterpolate(item.title)}</h3><p data-v-27673711>${ssrInterpolate(item.body)}</p></article>`);
      });
      _push(`<!--]--></div></div></section><section id="faq" class="section faq" data-v-27673711><div class="section-head" data-v-27673711><p class="eyebrow" data-v-27673711>FAQ</p><h2 data-v-27673711>Questions people usually ask before trying a new editor.</h2></div><div class="faq-list" data-v-27673711><!--[-->`);
      ssrRenderList(faqItems, (item) => {
        _push(`<article class="faq-item" data-v-27673711><h3 data-v-27673711>${ssrInterpolate(item.q)}</h3><p data-v-27673711>${ssrInterpolate(item.a)}</p></article>`);
      });
      _push(`<!--]--></div></section><section class="section final-cta" data-v-27673711><div class="final-cta__shell" data-v-27673711><p class="eyebrow" data-v-27673711>Try AuroraPad</p><h2 data-v-27673711>Download the latest build, inspect the repo, and shape the editor around your own workflow.</h2><div class="final-cta__options" data-v-27673711><!--[-->`);
      ssrRenderList(finalOptions, (item) => {
        _push(`<div class="final-cta__option" data-v-27673711><strong data-v-27673711>${ssrInterpolate(item.title)}</strong><span data-v-27673711>${ssrInterpolate(item.body)}</span></div>`);
      });
      _push(`<!--]--></div><div class="hero__actions" data-v-27673711><a class="site-btn site-btn--primary site-btn--large"${ssrRenderAttr("href", downloadUrl)} target="_blank" rel="noreferrer" data-v-27673711> Download AuroraPad </a><a class="site-btn site-btn--outline site-btn--large"${ssrRenderAttr("href", repoUrl)} target="_blank" rel="noreferrer" data-v-27673711> Browse Source </a></div></div></section><footer class="site-footer" data-v-27673711><div class="site-footer__inner" data-v-27673711><div data-v-27673711><strong data-v-27673711>AuroraPad</strong><p data-v-27673711>Cross-platform desktop editing with real project awareness.</p></div><div class="site-footer__links" data-v-27673711><a${ssrRenderAttr("href", repoUrl)} target="_blank" rel="noreferrer" data-v-27673711>GitHub</a><a${ssrRenderAttr("href", downloadUrl)} target="_blank" rel="noreferrer" data-v-27673711>Releases</a><a href="#workspace" data-v-27673711>Workspace</a><a href="#faq" data-v-27673711>FAQ</a>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/terms" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Terms`);
          } else {
            return [
              createTextVNode("Terms")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/privacy" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Privacy`);
          } else {
            return [
              createTextVNode("Privacy")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/usage" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Usage`);
          } else {
            return [
              createTextVNode("Usage")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/license" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`License`);
          } else {
            return [
              createTextVNode("License")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></footer></main></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("WebsiteApp.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const WebsiteApp = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-27673711"]]);
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "AuroraPad | Fast Desktop Editor for Focused Project Work",
      description: "AuroraPad is a modern cross-platform desktop editor with Monaco, workspace search, command palette workflows, plugin skills, semantic releases, and integrated terminal sessions.",
      ogTitle: "AuroraPad | Fast Desktop Editor for Focused Project Work",
      ogDescription: "A modern desktop editor for Windows, macOS, and Linux with workspace search, integrated terminal workflows, and CI-managed releases.",
      ogType: "website"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(WebsiteApp, _attrs, null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Dl-YZ_FA.mjs.map
