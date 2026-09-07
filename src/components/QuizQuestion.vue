<script setup>
import RadioButton from 'primevue/radiobutton'

defineProps({
  question: { type: String, required: true },
  options: { type: Array, required: true },
  selected: { type: Number, default: null },
  questionNumber: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div>
    <p class="mb-1 text-sm font-medium text-gray-400">Question {{ questionNumber }} of {{ totalQuestions }}</p>
    <h2 class="mb-6 text-xl font-semibold text-slate-900">{{ question }}</h2>

    <div class="flex flex-col gap-3">
      <label
        v-for="(option, index) in options"
        :key="index"
        class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
        :class="selected === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'"
      >
        <RadioButton :modelValue="selected" :value="index" @update:modelValue="emit('select', index)" />
        <span class="text-sm text-gray-800">{{ option }}</span>
      </label>
    </div>
  </div>
</template>
