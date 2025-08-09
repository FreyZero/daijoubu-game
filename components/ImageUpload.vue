<template>
  <div class="image-upload-container">
    <div class="input-group">
      <label for="cols">Columns (width):</label>
      <input type="number" id="cols" v-model.number="inputCols" min="1" max="20" />
    </div>
    <div class="input-group">
      <label for="rows">Rows (height):</label>
      <input type="number" id="rows" v-model.number="inputRows" min="1" max="20" />
    </div>
    <button @click="setBoardDimensions" :disabled="!inputCols || !inputRows" class="set-dimensions-button">
      Set Board Size
    </button>

    <hr class="divider" />

    <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />
    <p v-if="fileName">Selected file: {{ fileName }}</p>
    <button @click="uploadImage" :disabled="!selectedFile" class="upload-button">Upload Image</button>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const selectedFile = ref(null);
const fileName = ref('');
const inputCols = ref(5); // Default value
const inputRows = ref(5); // Default value

const emits = defineEmits(['image-uploaded', 'board-dimensions-set']);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    fileName.value = file.name;
  } else {
    selectedFile.value = null;
    fileName.value = '';
  }
};

const uploadImage = () => {
  if (selectedFile.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      emits('image-uploaded', e.target.result); // Send Base64 URL of image
    };
    reader.readAsDataURL(selectedFile.value);
  }
};

const setBoardDimensions = () => {
  if (inputCols.value > 0 && inputRows.value > 0) {
    emits('board-dimensions-set', { cols: inputCols.value, rows: inputRows.value });
  } else {
    alert('Please specify valid columns and rows (must be greater than 0)');
  }
};
</script>

<style scoped>
.image-upload-container {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
}

.input-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.input-group label {
  font-weight: bold;
  color: #555;
  text-align: right;
}

.input-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80px;
  text-align: center;
}

.set-dimensions-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.set-dimensions-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.set-dimensions-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.divider {
  border: 0;
  height: 1px;
  background: #eee;
  margin: 25px 0;
}

.file-input {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.upload-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.upload-button:hover:not(:disabled) {
  background-color: #45a049;
}

.upload-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

p {
  color: #555;
  margin-top: 10px;
  font-size: 0.9em;
}
</style>