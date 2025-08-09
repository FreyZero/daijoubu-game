<template>
  <div class="card upload-card">
    <div class="grid">
      <div class="field">
        <label class="label" for="cols">Columns</label>
        <input
          id="cols"
          v-model.number="inputCols"
          type="number"
          inputmode="numeric"
          min="1"
          max="50"
          class="input"
  >
      </div>
      <div class="field">
        <label class="label" for="rows">Rows</label>
        <input
          id="rows"
          v-model.number="inputRows"
          type="number"
          inputmode="numeric"
          min="1"
          max="50"
          class="input"
  >
      </div>
      <div class="field full">
        <button class="btn" :disabled="!validDims" @click="setBoardDimensions">
          Set Board Size
        </button>
      </div>
    </div>

    <div
      class="dropzone"
      :class="{ 'is-dragover': isDragOver }"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div v-if="!previewUrl" class="drop-content">
        <strong>Drag & drop</strong> an image here or
        <label class="link" for="fileInput">browse</label>
  <input id="fileInput" ref="fileInputEl" class="sr-only" type="file" accept="image/*" @change="handleFileChange">
        <div class="hint">PNG, JPG, or WEBP up to 5MB</div>
      </div>
      <div v-else class="preview">
  <img :src="previewUrl" alt="Selected preview">
        <div class="preview-actions">
          <button class="btn-outline" @click="clearFile">Remove</button>
          <button class="btn" :disabled="!selectedFile" @click="uploadImage">Use This Image</button>
        </div>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="fileName && !error" class="filename">Selected: {{ fileName }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue'

const emits = defineEmits<{
  (e: 'image-uploaded', dataUrl: string): void
  (e: 'board-dimensions-set', dims: { cols: number; rows: number }): void
}>()

const inputCols = ref(5)
const inputRows = ref(5)
const validDims = computed(() => inputCols.value > 0 && inputRows.value > 0)

const selectedFile = ref<File | null>(null)
const fileName = ref('')
const previewUrl = ref<string | null>(null)
const error = ref('')

const fileInputEl = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

function onDragEnter() { isDragOver.value = true }
function onDragOver() { isDragOver.value = true }
function onDragLeave() { isDragOver.value = false }
function onDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  error.value = ''
  // Validate type and size (<= 5MB)
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
    error.value = 'Unsupported file type. Please use PNG, JPG, or WEBP.'
    return
  }
  const maxBytes = 5 * 1024 * 1024
  if (file.size > maxBytes) {
    error.value = 'File too large. Max size is 5MB.'
    return
  }
  selectedFile.value = file
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewUrl.value = String(ev.target?.result || '')
  }
  reader.readAsDataURL(file)
}

function clearFile() {
  selectedFile.value = null
  fileName.value = ''
  previewUrl.value = null
  error.value = ''
  if (fileInputEl.value) {
    fileInputEl.value.value = ''
  }
}

function uploadImage() {
  if (!selectedFile.value || !previewUrl.value) return
  emits('image-uploaded', previewUrl.value)
}

function setBoardDimensions() {
  if (!validDims.value) return
  emits('board-dimensions-set', { cols: inputCols.value, rows: inputRows.value })
}
</script>

<style scoped>
.card.upload-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
.label { font-weight: 600; color: #334155; font-size: 0.95rem; }
.input {
  border: 1px solid #cbd5e1;
  padding: 8px 10px;
  border-radius: 8px;
  outline: none;
}
.input:focus { border-color: var(--brand-pink-500); box-shadow: 0 0 0 2px rgba(236,72,153,0.2); }

.dropzone {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  background: #f8fafc;
}
.dropzone.is-dragover { background: #fff1f2; border-color: var(--brand-pink-500); }
.drop-content { color: #475569; }
.drop-content .link { color: var(--brand-pink-500); text-decoration: underline; cursor: pointer; }
.drop-content .sr-only { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.hint { margin-top: 6px; color: #64748b; font-size: 0.9rem; }

.preview { display: grid; gap: 10px; }
.preview img { max-width: 100%; height: auto; border-radius: 10px; border: 1px solid #e2e8f0; }
.preview-actions { display: flex; gap: 8px; justify-content: center; }

.btn {
  background-color: var(--brand-pink-500);
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline {
  background: transparent;
  color: var(--brand-pink-500);
  border: 2px solid var(--brand-pink-500);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.error { color: #dc2626; margin-top: 10px; }
.filename { color: #475569; margin-top: 6px; font-size: 0.9rem; }

@media (max-width: 740px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .grid { grid-template-columns: 1fr; }
  .preview-actions { flex-wrap: wrap; }
}
</style>