<template>
  <div class="puzzle-game-container">
    <div class="controls">
  <button class="reset-button" @click="resetBoard">Reset Tiles</button>
  <button class="toggle-overlay-button" @click="toggleOverlay">
        {{ showOverlay ? 'Hide Numbers' : 'Show Numbers' }}
      </button>
    </div>

    <div class="board-wrapper" :style="boardWrapperStyle">
  <img :src="imageUrl" class="underlying-image">
      <div class="puzzle-board" :style="boardStyle">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          class="puzzle-tile"
          :class="{ 'is-hidden': tile.isHidden, 'show-overlay': showOverlay && !tile.isHidden }"
          @click="revealTile(tile.id)"
        >
          <span v-if="showOverlay && !tile.isHidden" class="tile-number">{{ tile.id + 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  boardCols: {
    type: Number,
    default: 5, // Number of columns
  },
  boardRows: {
    type: Number,
    default: 5, // Number of rows
  },
});

const tiles = ref([]);
const imageAspectRatio = ref(1);
const boardWrapperStyle = ref({});
const showOverlay = ref(false); // State for toggling number overlay

// Calculate total number of tiles
const totalTiles = computed(() => props.boardCols * props.boardRows);

// Board style
const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.boardCols}, 1fr)`,
  gridTemplateRows: `repeat(${props.boardRows}, 1fr)`,
}));

// Load image and get size
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

// Adjust board wrapper size to image aspect ratio
const adjustBoardWrapperSize = () => {
  boardWrapperStyle.value = {
    aspectRatio: `${imageAspectRatio.value}`,
  };
};

// Initialize tiles
const initializeTiles = () => {
  tiles.value = Array.from({ length: totalTiles.value }, (_, i) => ({
    id: i,
    isHidden: false,
  }));
};

// Reveal a tile
const revealTile = (id) => {
  const tile = tiles.value.find((t) => t.id === id);
  if (tile && !tile.isHidden) {
    tile.isHidden = true;
  }
};

// Reset all tiles
const resetBoard = () => {
  tiles.value.forEach((tile) => {
    tile.isHidden = false;
  });
  showOverlay.value = false; // Hide numbers on reset
};

// Toggle number overlay
const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value;
};

// Watch for changes in imageUrl, boardCols, or boardRows
watch(() => [props.imageUrl, props.boardCols, props.boardRows], async ([newImageUrl, newCols, newRows]) => {
  if (newImageUrl && newCols && newRows) {
    await loadImage(newImageUrl);
    adjustBoardWrapperSize();
    initializeTiles();
  } else {
    imageAspectRatio.value = 1;
    boardWrapperStyle.value = {}; // Reset style if no image/dimensions
    tiles.value = [];
  }
}, { immediate: true });
</script>

<style scoped>
.puzzle-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%; /* Let container be full width for board-wrapper */
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 15px;
  margin-bottom: 10px;
}

.board-wrapper {
  position: relative;
  width: min(92vw, 900px);
  max-width: 900px; /* Max width for large screens */
  border: 2px solid #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  /* aspectRatio set by script */
}

.underlying-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Keep aspect ratio */
}

.puzzle-board {
  display: grid;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.puzzle-tile {
  background-color: rgba(0, 0, 0, 0.7); /* Tile color */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Tile border */
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out, background-color 0.3s ease;
  user-select: none;
}

/* Animation when tile is hidden */
.puzzle-tile.is-hidden {
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
}

/* Style for number overlay */
.puzzle-tile.show-overlay {
  background-color: rgba(0, 0, 0, 1);
  color: white;
  font-size: 2em;
}

.tile-number {
  pointer-events: none;
}

.reset-button,
.toggle-overlay-button {
  background-color: #f44336;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.reset-button:hover {
  background-color: #da190b;
}

.toggle-overlay-button {
  background-color: var(--brand-pink-500);
}

.toggle-overlay-button:hover {
  background-color: #db2777; /* slightly darker pink */
}

@media (min-width: 768px) {
  .board-wrapper { width: min(80vw, 900px); }
}
</style>