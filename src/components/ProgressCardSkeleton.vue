<script setup>
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div class="mb-2 flex items-baseline justify-between">
      <Skeleton width="6rem" height="0.875rem" />
      <Skeleton width="2rem" height="0.875rem" />
    </div>
    <Skeleton width="100%" height="0.5rem" borderRadius="1rem" />
  </div>
</template>
