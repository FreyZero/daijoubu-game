<template>
  <div class="puzzle-container">
    <ImageUpload @image-uploaded="handleImageUploaded" @board-dimensions-set="handleBoardDimensionsSet" />
    <template v-if="imageUrl && boardCols && boardRows">
      <PuzzleBoard :imageUrl="imageUrl" :boardCols="boardCols" :boardRows="boardRows" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ImageUpload from '~/components/ImageUpload.vue';
import PuzzleBoard from '~/components/PuzzleBoard.vue';

const imageUrl = ref(null);
const boardCols = ref(5);
const boardRows = ref(5);

const handleImageUploaded = (url) => {
  imageUrl.value = url;
};

const handleBoardDimensionsSet = (dimensions) => {
  boardCols.value = dimensions.cols;
  boardRows.value = dimensions.rows;
};
</script>

<style scoped>
.puzzle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px var(--page-x);
  font-family: Arial, sans-serif;
  width: 100%;
  gap: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}
</style>