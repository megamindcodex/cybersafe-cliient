<script setup>
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

const props = defineProps({
  lesson: { type: Object, required: true },
  completed: { type: Boolean, default: false },
})

const router = useRouter()

const categoryLabel = (category) => category.replaceAll('_', ' ')

const goToLesson = () => router.push({ name: 'lesson-detail', params: { id: props.lesson.id ?? props.lesson._id } })
</script>

<template>
  <Card class="h-full">
    <template #title>
      <div class="flex items-center justify-between gap-2">
        <Tag :value="categoryLabel(lesson.category)" severity="info" />
        <Tag v-if="completed" value="Completed" severity="success" />
      </div>
    </template>
    <template #subtitle>{{ lesson.title }}</template>
    <template #content>
      <p class="text-sm text-gray-600">{{ lesson.description }}</p>
      <p class="mt-3 text-xs font-medium text-gray-400">{{ lesson.estimatedMinutes }} min</p>
    </template>
    <template #footer>
      <Button class="w-full" :label="completed ? 'Review Lesson' : 'Start Lesson'" @click="goToLesson" />
    </template>
  </Card>
</template>
