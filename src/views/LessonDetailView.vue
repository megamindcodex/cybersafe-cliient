<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'

import http from '@/api/http.js'
import { useProgressStore } from '@/stores/progressStore.js'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const progressStore = useProgressStore()

const lesson = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const isCompleting = ref(false)

const isCompleted = computed(() => {
  const completedIds = (progressStore.progress?.completedLessons ?? []).map((completedLesson) => completedLesson.id ?? completedLesson._id ?? completedLesson)
  return completedIds.includes(route.params.id)
})

const contentParagraphs = computed(() => lesson.value?.content.split('\n\n') ?? [])

const loadLesson = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const [{ lesson: fetchedLesson }] = await Promise.all([
      http.get(`/lessons/${route.params.id}`),
      progressStore.progress ? Promise.resolve() : progressStore.fetchProgressRequest(),
    ])
    lesson.value = fetchedLesson
  } catch {
    loadError.value = 'Unable to load this lesson. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleMarkComplete = async () => {
  isCompleting.value = true

  try {
    await progressStore.completeLessonRequest(route.params.id)
    toast.add({ severity: 'success', summary: 'Lesson completed', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Could not update progress', detail: error.message, life: 4000 })
  } finally {
    isCompleting.value = false
  }
}

const goToQuiz = () => router.push({ name: 'quiz', params: { lessonId: route.params.id } })

onMounted(loadLesson)
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <p v-if="loadError" class="text-red-600">{{ loadError }}</p>

    <template v-else-if="isLoading">
      <div class="flex items-center gap-2">
        <Skeleton width="5rem" height="1.5rem" borderRadius="1rem" />
        <Skeleton width="4rem" height="0.875rem" />
      </div>

      <Skeleton width="70%" height="2rem" class="mt-3" />

      <div class="mt-6 space-y-3">
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="90%" height="1rem" />
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="60%" height="1rem" />
      </div>

      <Skeleton width="100%" height="8rem" class="mt-6" borderRadius="0.5rem" />

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton width="10rem" height="2.5rem" />
        <Skeleton width="8rem" height="2.5rem" />
      </div>
    </template>

    <template v-else-if="lesson">
      <div class="flex items-center gap-2">
        <Tag :value="lesson.category.replaceAll('_', ' ')" severity="info" />
        <span class="text-sm text-gray-400">{{ lesson.estimatedMinutes }} min read</span>
      </div>

      <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ lesson.title }}</h1>

      <div class="mt-6 space-y-4 text-gray-700">
        <p v-for="(paragraph, index) in contentParagraphs" :key="index">{{ paragraph }}</p>
      </div>

      <div v-if="lesson.keyPoints?.length" class="mt-6 rounded-lg bg-blue-50 p-5">
        <p class="mb-2 font-semibold text-slate-900">Key things to remember:</p>
        <ul class="space-y-1">
          <li v-for="point in lesson.keyPoints" :key="point" class="text-sm text-slate-700">✓ {{ point }}</li>
        </ul>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          :label="isCompleted ? 'Completed' : 'Mark as Complete'"
          :severity="isCompleted ? 'success' : 'primary'"
          :disabled="isCompleted"
          :loading="isCompleting"
          @click="handleMarkComplete"
        />
        <Button label="Take Quiz" severity="secondary" outlined @click="goToQuiz" />
      </div>
    </template>
  </div>
</template>
