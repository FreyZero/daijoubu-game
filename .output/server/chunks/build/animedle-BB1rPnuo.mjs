import { _ as __nuxt_component_0 } from './client-only-D9w3nt3Q.mjs';
import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';
import 'better-sqlite3';
import 'ipx';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "animedle",
  __ssrInlineRender: true,
  setup(__props) {
    const mode = ref("anime");
    ref(0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "page-wrapper",
        style: { "max-width": "960px", "margin": "0 auto" }
      }, _attrs))} data-v-958e3fe7><h1 class="text-3xl font-bold mb-4" data-v-958e3fe7>Animedle</h1><div class="controls" style="${ssrRenderStyle({ "display": "flex", "gap": "1rem", "align-items": "center", "margin-bottom": "1rem" })}" data-v-958e3fe7><label style="${ssrRenderStyle({ "display": "flex", "gap": "0.4rem", "align-items": "center" })}" data-v-958e3fe7><input type="radio" value="anime"${ssrIncludeBooleanAttr(ssrLooseEqual(mode.value, "anime")) ? " checked" : ""} data-v-958e3fe7> Anime </label><label style="${ssrRenderStyle({ "display": "flex", "gap": "0.4rem", "align-items": "center" })}" data-v-958e3fe7><input type="radio" value="character"${ssrIncludeBooleanAttr(ssrLooseEqual(mode.value, "character")) ? " checked" : ""} data-v-958e3fe7> Character </label><button class="btn" data-v-958e3fe7>New Game</button></div>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/game/animedle.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const animedle = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-958e3fe7"]]);

export { animedle as default };
//# sourceMappingURL=animedle-BB1rPnuo.mjs.map
