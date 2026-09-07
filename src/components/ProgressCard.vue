<script setup>
import ProgressBar from 'primevue/progressbar'

defineProps({
  label: { type: String, required: true },
  percentage: { type: Number, required: true },
  detail: { type: String, default: '' },
})
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div class="mb-2 flex items-baseline justify-between">
      <p class="text-sm font-medium text-gray-700">{{ label }}</p>
      <p class="text-sm font-semibold text-slate-900">{{ percentage }}%</p>
    </div>
    <ProgressBar :value="percentage" :showValue="false" style="height: 0.5rem" />
    <p v-if="detail" class="mt-2 text-xs text-gray-500">{{ detail }}</p>
  </div>
</template>
