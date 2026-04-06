import { _ as __nuxt_component_0 } from './nuxt-link-DLMGPo7Y.mjs';
import { mergeProps, withCtx, unref, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue/server-renderer/index.mjs';
import { a as appIcon } from './aurorapad-app-icon-CAhyaE2D.mjs';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = {
  __name: "LegalPage",
  __ssrInlineRender: true,
  props: {
    page: {
      type: Object,
      required: true
    },
    repoUrl: {
      type: String,
      required: true
    },
    downloadUrl: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "legal-app" }, _attrs))} data-v-42845be0><div class="legal-bg" aria-hidden="true" data-v-42845be0><span class="legal-orb legal-orb--blue" data-v-42845be0></span><span class="legal-orb legal-orb--violet" data-v-42845be0></span><span class="legal-grid" data-v-42845be0></span></div><header class="legal-header" data-v-42845be0><div class="legal-header__inner" data-v-42845be0>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "legal-brand",
        "aria-label": "AuroraPad home"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img class="legal-brand__icon"${ssrRenderAttr("src", unref(appIcon))} alt="" data-v-42845be0${_scopeId}><span class="legal-brand__copy" data-v-42845be0${_scopeId}><strong data-v-42845be0${_scopeId}>AuroraPad</strong><small data-v-42845be0${_scopeId}>${ssrInterpolate(__props.page.kicker)}</small></span>`);
          } else {
            return [
              createVNode("img", {
                class: "legal-brand__icon",
                src: unref(appIcon),
                alt: ""
              }, null, 8, ["src"]),
              createVNode("span", { class: "legal-brand__copy" }, [
                createVNode("strong", null, "AuroraPad"),
                createVNode("small", null, toDisplayString(__props.page.kicker), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="legal-header__actions" data-v-42845be0>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Home`);
          } else {
            return [
              createTextVNode("Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a${ssrRenderAttr("href", __props.repoUrl)} target="_blank" rel="noreferrer" data-v-42845be0>Repository</a><a${ssrRenderAttr("href", __props.downloadUrl)} target="_blank" rel="noreferrer" data-v-42845be0>Releases</a></div></div></header><main data-v-42845be0><section class="legal-hero" data-v-42845be0><div class="legal-shell" data-v-42845be0><p class="legal-eyebrow" data-v-42845be0>${ssrInterpolate(__props.page.kicker)}</p><h1 data-v-42845be0>${ssrInterpolate(__props.page.title)}</h1><p class="legal-summary" data-v-42845be0>${ssrInterpolate(__props.page.summary)}</p><div class="legal-meta" data-v-42845be0><div class="legal-meta__item" data-v-42845be0><span data-v-42845be0>Applies to</span><strong data-v-42845be0>${ssrInterpolate(__props.page.appliesTo)}</strong></div><div class="legal-meta__item" data-v-42845be0><span data-v-42845be0>Last updated</span><strong data-v-42845be0>${ssrInterpolate(__props.page.updatedAt)}</strong></div></div></div></section><section class="legal-content" data-v-42845be0><div class="legal-shell legal-shell--narrow" data-v-42845be0><!--[-->`);
      ssrRenderList(__props.page.sections, (section) => {
        _push(`<article class="legal-section" data-v-42845be0><h2 data-v-42845be0>${ssrInterpolate(section.title)}</h2><!--[-->`);
        ssrRenderList(section.paragraphs, (paragraph) => {
          _push(`<p data-v-42845be0>${ssrInterpolate(paragraph)}</p>`);
        });
        _push(`<!--]--></article>`);
      });
      _push(`<!--]--><div class="legal-links" data-v-42845be0>`);
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
      _push(`</div></div></section></main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("LegalPage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const LegalPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-42845be0"]]);
const repoUrl = "https://github.com/ali111887/AuroraPad";
const downloadUrl = "https://github.com/ali111887/AuroraPad/releases";
const legalPages = {
  terms: {
    kicker: "Terms and Conditions",
    title: "Terms and Conditions",
    summary: "These terms describe the baseline rules for using the AuroraPad website, downloading releases, and interacting with the public project materials.",
    appliesTo: "Website, releases, and public project materials",
    updatedAt: "April 6, 2026",
    sections: [
      {
        title: "1. Scope",
        paragraphs: [
          "These terms apply to the AuroraPad website and publicly distributed release materials. They are intended to explain how visitors may access the website, download software releases, and interact with the project materials that are made available by the AuroraPad maintainers.",
          "If you are using the AuroraPad source code itself, the repository license governs your rights to copy, modify, and redistribute that code. These website terms do not replace the repository license."
        ]
      },
      {
        title: "2. Use of the Website and Releases",
        paragraphs: [
          "You may browse the website, read project information, and download publicly posted release assets for lawful purposes. You agree not to interfere with the availability, security, or normal operation of the website or release distribution channels.",
          "You are responsible for verifying that a downloaded release is appropriate for your environment and for reviewing the project materials before using AuroraPad in any production or organizational workflow."
        ]
      },
      {
        title: "3. No Warranty for Public Information",
        paragraphs: [
          "The website and release materials are provided on an as-is basis. The maintainers do not guarantee uninterrupted availability, error-free operation, or fitness for a particular use case through the website content alone.",
          "Nothing on the website should be interpreted as professional legal, compliance, privacy, or security advice. Project materials may evolve over time and should be evaluated in their current form before reliance."
        ]
      },
      {
        title: "4. Third-Party Platforms",
        paragraphs: [
          "AuroraPad may be distributed or referenced through third-party services such as GitHub and Vercel. Those services operate under their own terms and privacy practices, and AuroraPad maintainers are not responsible for third-party platform behavior outside the project-controlled website content."
        ]
      }
    ]
  },
  privacy: {
    kicker: "Privacy",
    title: "Privacy Notice",
    summary: "This page explains the limited privacy expectations for the AuroraPad website and public release distribution pages.",
    appliesTo: "Website visitors and release downloads",
    updatedAt: "April 6, 2026",
    sections: [
      {
        title: "1. Data Collected Through the Website",
        paragraphs: [
          "AuroraPad does not currently present account creation, payment flows, or user profile management through this website. In general, the site is intended to be informational and to direct visitors to the public repository and release assets.",
          "Hosting providers, CDN services, or linked platforms may still process routine technical information such as IP addresses, request logs, browser information, or referral data as part of normal website delivery and security operations."
        ]
      },
      {
        title: "2. Release Downloads and External Platforms",
        paragraphs: [
          "When you click repository or download links, you may be transferred to GitHub or other third-party services. Those services control their own logging, cookies, analytics, and account systems. AuroraPad maintainers do not control those third-party privacy practices."
        ]
      },
      {
        title: "3. Cookies and Analytics",
        paragraphs: [
          "This website is not presented as a user-account product or tracking-heavy service. If hosting infrastructure uses essential operational cookies, caching, or request logging, that processing is typically limited to what is required to deliver and secure the site.",
          "If dedicated analytics or behavioral tracking are added later, this notice should be updated to reflect that change more specifically."
        ]
      },
      {
        title: "4. Questions",
        paragraphs: [
          "For project-level questions about website content, repository materials, or release information, the public repository is the primary source of truth. Visitors should review the repository and release notes directly when they need the latest current information."
        ]
      }
    ]
  },
  usage: {
    kicker: "Usage Policy",
    title: "Acceptable Usage",
    summary: "AuroraPad is intended for lawful software development, editing, and related project workflows. This page outlines the expected boundaries around public use of the website and software releases.",
    appliesTo: "Website use and software usage expectations",
    updatedAt: "April 6, 2026",
    sections: [
      {
        title: "1. Intended Use",
        paragraphs: [
          "AuroraPad is presented as a desktop editor for code, project navigation, terminal workflows, and release-oriented development tasks. It is intended for lawful engineering, writing, and development-related work."
        ]
      },
      {
        title: "2. Prohibited Use",
        paragraphs: [
          "You should not use the website or software releases in ways that violate applicable law, harm third-party systems, distribute malware, abuse infrastructure, or misrepresent AuroraPad as a supported managed service when it is not being offered as one.",
          "You should not attempt to use the public release channels to overload hosting resources, scrape protected infrastructure, or interfere with the availability of the project website or repository resources."
        ]
      },
      {
        title: "3. Security and Verification",
        paragraphs: [
          "Before deploying AuroraPad in any sensitive or production-like environment, you should review the source code, release notes, and license terms directly. Public binaries should be validated according to your own security and compliance standards."
        ]
      },
      {
        title: "4. Community Expectations",
        paragraphs: [
          "If you contribute, fork, or build on AuroraPad, the strongest default is transparency: keep changes reviewable, credit the project correctly, and preserve the legal and license information attached to the repository."
        ]
      }
    ]
  },
  license: {
    kicker: "License",
    title: "License Overview",
    summary: "AuroraPad source distribution is governed by the repository license. This page summarizes that relationship and points visitors to the authoritative license file.",
    appliesTo: "Source code and distribution rights",
    updatedAt: "April 6, 2026",
    sections: [
      {
        title: "1. Authoritative License Source",
        paragraphs: [
          "The authoritative license text for AuroraPad is the LICENSE file in the repository. If there is any difference between this page and the repository license text, the repository license file controls.",
          "At the time of this page update, the repository includes a GNU General Public License text in the root LICENSE file."
        ]
      },
      {
        title: "2. What This Means in Practice",
        paragraphs: [
          "Your rights to use, modify, and redistribute AuroraPad source code depend on the actual repository license text and any related notices or third-party dependency licenses that apply to bundled components.",
          "If you plan to redistribute AuroraPad or incorporate parts of the project into another distribution, review the repository license and any third-party license requirements carefully before proceeding."
        ]
      },
      {
        title: "3. Third-Party Components",
        paragraphs: [
          "AuroraPad includes dependencies and frameworks that may be governed by their own licenses. Those third-party licenses remain applicable to the components they cover."
        ]
      },
      {
        title: "4. Where to Review the Full Text",
        paragraphs: [
          "You can review the current repository license directly in the AuroraPad GitHub repository root. The repository is the best place to confirm the latest licensing state before relying on any summary."
        ]
      }
    ]
  }
};

export { LegalPage as L, downloadUrl as d, legalPages as l, repoUrl as r };
//# sourceMappingURL=site-otKHABhJ.mjs.map
