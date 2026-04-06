import { defineComponent, mergeProps, unref, useSSRContext } from 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue/index.mjs';
import { ssrRenderComponent } from 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue/server-renderer/index.mjs';
import { L as LegalPage, d as downloadUrl, r as repoUrl, l as legalPages } from './site-otKHABhJ.mjs';
import { u as useSeoMeta } from './composables-C1GJy1oh.mjs';
import './nuxt-link-DLMGPo7Y.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/ufo/dist/index.mjs';
import './server.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/h3/dist/index.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/destr/dist/index.mjs';
import '../nitro/nitro.mjs';
import 'file:///Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/node_modules/nitropack/node_modules/hookable/dist/index.mjs';
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
import './aurorapad-app-icon-CAhyaE2D.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "license",
  __ssrInlineRender: true,
  setup(__props) {
    const page = legalPages.license;
    useSeoMeta({
      title: `AuroraPad | ${page.title}`,
      description: page.summary
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(LegalPage, mergeProps({
        page: unref(page),
        "repo-url": unref(repoUrl),
        "download-url": unref(downloadUrl)
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/license.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=license-Cvp0e0lo.mjs.map
