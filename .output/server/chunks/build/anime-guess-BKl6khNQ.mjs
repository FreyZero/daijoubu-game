import { _ as __nuxt_component_0 } from './client-only-D9w3nt3Q.mjs';
import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
  __name: "anime-guess",
  __ssrInlineRender: true,
  setup(__props) {
    const totalRounds = ref(10);
    const roundsPlayed = ref(0);
    const score = ref(0);
    const answeredThisRound = ref(false);
    ref(0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "page-wrapper",
        style: { "max-width": "960px", "margin": "0 auto" }
      }, _attrs))} data-v-4a5fa645><h1 class="text-3xl font-bold mb-4" data-v-4a5fa645>Guess the Anime</h1><div class="mb-4" style="${ssrRenderStyle({ "display": "flex", "gap": "1rem", "align-items": "center" })}" data-v-4a5fa645><div data-v-4a5fa645>Score: ${ssrInterpolate(score.value)} / ${ssrInterpolate(roundsPlayed.value)}</div><div data-v-4a5fa645>Target Rounds: ${ssrInterpolate(totalRounds.value)}</div></div>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`<div class="mt-6" style="${ssrRenderStyle({ "display": "flex", "gap": "0.75rem" })}" data-v-4a5fa645><button class="btn"${ssrIncludeBooleanAttr(!answeredThisRound.value || roundsPlayed.value >= totalRounds.value) ? " disabled" : ""} data-v-4a5fa645> Next Round </button><button class="btn-outline" data-v-4a5fa645>Reset Game</button></div>`);
      if (roundsPlayed.value >= totalRounds.value) {
        _push(`<div class="mt-6 p-4 rounded" style="${ssrRenderStyle({ "background": "#f1f5f9" })}" data-v-4a5fa645><strong data-v-4a5fa645>Game over!</strong><div data-v-4a5fa645>Your final score: ${ssrInterpolate(score.value)} / ${ssrInterpolate(totalRounds.value)}</div><div class="mt-2" data-v-4a5fa645><button class="btn" data-v-4a5fa645>Play Again</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/game/anime-guess.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const animeGuess = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4a5fa645"]]);

export { animeGuess as default };
//# sourceMappingURL=anime-guess-BKl6khNQ.mjs.map
