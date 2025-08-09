import { ref, mergeProps, computed, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
import 'ipx';
import 'node:path';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const _sfc_main$2 = {
  __name: "ImageUpload",
  __ssrInlineRender: true,
  emits: ["image-uploaded", "board-dimensions-set"],
  setup(__props, { emit: __emit }) {
    const selectedFile = ref(null);
    const fileName = ref("");
    const inputCols = ref(5);
    const inputRows = ref(5);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "image-upload-container" }, _attrs))} data-v-9667fb8b><div class="input-group" data-v-9667fb8b><label for="cols" data-v-9667fb8b>Columns (width):</label><input type="number" id="cols"${ssrRenderAttr("value", inputCols.value)} min="1" max="20" data-v-9667fb8b></div><div class="input-group" data-v-9667fb8b><label for="rows" data-v-9667fb8b>Rows (height):</label><input type="number" id="rows"${ssrRenderAttr("value", inputRows.value)} min="1" max="20" data-v-9667fb8b></div><button${ssrIncludeBooleanAttr(!inputCols.value || !inputRows.value) ? " disabled" : ""} class="set-dimensions-button" data-v-9667fb8b> Set Board Size </button><hr class="divider" data-v-9667fb8b><input type="file" accept="image/*" class="file-input" data-v-9667fb8b>`);
      if (fileName.value) {
        _push(`<p data-v-9667fb8b>Selected file: ${ssrInterpolate(fileName.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button${ssrIncludeBooleanAttr(!selectedFile.value) ? " disabled" : ""} class="upload-button" data-v-9667fb8b>Upload Image</button></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ImageUpload.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const ImageUpload = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-9667fb8b"]]);
const _sfc_main$1 = {
  __name: "PuzzleBoard",
  __ssrInlineRender: true,
  props: {
    imageUrl: {
      type: String,
      required: true
    },
    boardCols: {
      type: Number,
      default: 5
      // Number of columns
    },
    boardRows: {
      type: Number,
      default: 5
      // Number of rows
    }
  },
  setup(__props) {
    const props = __props;
    const tiles = ref([]);
    const imageAspectRatio = ref(1);
    const boardWrapperStyle = ref({});
    const showOverlay = ref(false);
    const totalTiles = computed(() => props.boardCols * props.boardRows);
    const boardStyle = computed(() => ({
      gridTemplateColumns: `repeat(${props.boardCols}, 1fr)`,
      gridTemplateRows: `repeat(${props.boardRows}, 1fr)`
    }));
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageAspectRatio.value = img.width / img.height;
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    };
    const adjustBoardWrapperSize = () => {
      boardWrapperStyle.value = {
        aspectRatio: `${imageAspectRatio.value}`
      };
    };
    const initializeTiles = () => {
      tiles.value = Array.from({ length: totalTiles.value }, (_, i) => ({
        id: i,
        isHidden: false
      }));
    };
    watch(() => [props.imageUrl, props.boardCols, props.boardRows], async ([newImageUrl, newCols, newRows]) => {
      if (newImageUrl && newCols && newRows) {
        await loadImage(newImageUrl);
        adjustBoardWrapperSize();
        initializeTiles();
      } else {
        imageAspectRatio.value = 1;
        boardWrapperStyle.value = {};
        tiles.value = [];
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "puzzle-game-container" }, _attrs))} data-v-3722e41b><div class="controls" data-v-3722e41b><button class="reset-button" data-v-3722e41b>Reset Tiles</button><button class="toggle-overlay-button" data-v-3722e41b>${ssrInterpolate(showOverlay.value ? "Hide Numbers" : "Show Numbers")}</button></div><div class="board-wrapper" style="${ssrRenderStyle(boardWrapperStyle.value)}" data-v-3722e41b><img${ssrRenderAttr("src", __props.imageUrl)} class="underlying-image" data-v-3722e41b><div class="puzzle-board" style="${ssrRenderStyle(boardStyle.value)}" data-v-3722e41b><!--[-->`);
      ssrRenderList(tiles.value, (tile) => {
        _push(`<div class="${ssrRenderClass([{ "is-hidden": tile.isHidden, "show-overlay": showOverlay.value && !tile.isHidden }, "puzzle-tile"])}" data-v-3722e41b>`);
        if (showOverlay.value && !tile.isHidden) {
          _push(`<span class="tile-number" data-v-3722e41b>${ssrInterpolate(tile.id + 1)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PuzzleBoard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const PuzzleBoard = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-3722e41b"]]);
const _sfc_main = {
  __name: "puzzle",
  __ssrInlineRender: true,
  setup(__props) {
    const imageUrl = ref(null);
    const boardCols = ref(null);
    const boardRows = ref(null);
    const handleImageUploaded = (url) => {
      imageUrl.value = url;
    };
    const handleBoardDimensionsSet = (dimensions) => {
      boardCols.value = dimensions.cols;
      boardRows.value = dimensions.rows;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-0b92db5b>`);
      _push(ssrRenderComponent(ImageUpload, {
        onImageUploaded: handleImageUploaded,
        onBoardDimensionsSet: handleBoardDimensionsSet
      }, null, _parent));
      if (imageUrl.value && boardCols.value && boardRows.value) {
        _push(ssrRenderComponent(PuzzleBoard, {
          imageUrl: imageUrl.value,
          boardCols: boardCols.value,
          boardRows: boardRows.value
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/game/puzzle.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const puzzle = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0b92db5b"]]);

export { puzzle as default };
//# sourceMappingURL=puzzle-4L4uCN7k.mjs.map
