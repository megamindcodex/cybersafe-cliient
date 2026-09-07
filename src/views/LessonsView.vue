<script setup>
import { ref, computed, onMounted } from 'vue'

import http from '@/api/http.js'
import { useProgressStore } from '@/stores/progressStore.js'
import LessonCard from '@/components/LessonCard.vue'
import LessonCardSkeleton from '@/components/LessonCardSkeleton.vue'

const progressStore = useProgressStore()

const lessons = ref([])
const isLoading = ref(true)
const loadError = ref('')

const completedLessonIds = computed(
  () => new Set((progressStore.progress?.completedLessons ?? []).map((lesson) => lesson.id ?? lesson._id ?? lesson)),
)

onMounted(async () => {
  try {
    const [{ lessons: fetchedLessons }] = await Promise.all([http.get('/lessons'), progressStore.fetchProgressRequest()])
    lessons.value = fetchedLessons
  } catch {
    loadError.value = 'Unable to load lessons. Please try again.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Lessons</h1>
    <p class="mt-1 text-gray-500">Six short lessons covering the essentials of staying safe online.</p>

    <p v-if="loadError" class="mt-8 text-red-600">{{ loadError }}</p>

    <div v-else-if="isLoading" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LessonCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <div v-else class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LessonCard
        v-for="lesson in lessons"
        :key="lesson.id ?? lesson._id"
        :lesson="lesson"
        :completed="completedLessonIds.has(lesson.id ?? lesson._id)"
      />
    </div>
  </div>
</template>
