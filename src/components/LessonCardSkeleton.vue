<script setup>
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <Card class="h-full">
    <template #title>
      <Skeleton width="5rem" height="1.5rem" borderRadius="1rem" />
    </template>
    <template #subtitle>
      <Skeleton width="60%" height="1.25rem" class="mt-1" />
    </template>
    <template #content>
      <Skeleton width="100%" height="0.875rem" class="mb-2" />
      <Skeleton width="80%" height="0.875rem" class="mb-3" />
      <Skeleton width="3rem" height="0.75rem" />
    </template>
    <template #footer>
      <Skeleton width="100%" height="2.5rem" />
    </template>
  </Card>
</template>
