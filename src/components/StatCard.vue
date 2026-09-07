<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  suffix: { type: String, default: '' },
})
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <p class="text-2xl font-bold text-slate-900">{{ value }}<span class="text-lg font-medium text-gray-400">{{ suffix }}</span></p>
    <p class="mt-1 text-sm text-gray-500">{{ label }}</p>
  </div>
</template>
