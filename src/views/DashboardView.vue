<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Skeleton from 'primevue/skeleton'

import http from '@/api/http.js'
import { useAuthStore } from '@/stores/authStore.js'
import { useProgressStore } from '@/stores/progressStore.js'
import StatCard from '@/components/StatCard.vue'
import StatCardSkeleton from '@/components/StatCardSkeleton.vue'
import LessonCard from '@/components/LessonCard.vue'
import LessonCardSkeleton from '@/components/LessonCardSkeleton.vue'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const progressStore = useProgressStore()
const { progress, quizAttempts } = storeToRefs(progressStore)

const lessons = ref([])
const isLoading = ref(true)
const loadError = ref('')

const completedLessonIds = computed(() => new Set((progress.value?.completedLessons ?? []).map((lesson) => lesson.id ?? lesson._id ?? lesson)))

onMounted(async () => {
  try {
    const [{ lessons: fetchedLessons }] = await Promise.all([
      http.get('/lessons'),
      progressStore.fetchProgressRequest(),
      progressStore.fetchQuizAttemptsRequest(),
    ])
    lessons.value = fetchedLessons
  } catch {
    loadError.value = 'Unable to load your dashboard. Please try again.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Welcome back, {{ user?.name }}</h1>
    <p class="mt-1 text-gray-500">Your cybersecurity learning journey</p>

    <p v-if="loadError" class="mt-8 text-red-600">{{ loadError }}</p>

    <template v-else-if="isLoading">
      <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCardSkeleton v-for="n in 4" :key="n" />
      </div>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Continue Learning</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LessonCardSkeleton v-for="n in 3" :key="n" />
      </div>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Recent Quiz Results</h2>
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div v-for="n in 3" :key="n" class="flex items-center justify-between border-b border-gray-100 px-5 py-3 last:border-b-0">
          <Skeleton width="8rem" height="1rem" />
          <Skeleton width="5rem" height="1rem" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Lessons Completed" :value="`${progress.lessonsCompleted}/${progress.totalLessons}`" />
        <StatCard label="Quiz Average" :value="progress.quizAverage" suffix="%" />
        <StatCard label="Phishing Score" :value="progress.phishingScore" suffix="%" />
        <StatCard label="Overall Progress" :value="progress.overallPercentage" suffix="%" />
      </div>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Continue Learning</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LessonCard
          v-for="lesson in lessons"
          :key="lesson.id ?? lesson._id"
          :lesson="lesson"
          :completed="completedLessonIds.has(lesson.id ?? lesson._id)"
        />
      </div>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Recent Quiz Results</h2>
      <div v-if="quizAttempts.length === 0" class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No quiz attempts yet. Complete your first quiz to see your results here.
      </div>
      <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div
          v-for="attempt in quizAttempts.slice(0, 5)"
          :key="attempt.id ?? attempt._id"
          class="flex items-center justify-between border-b border-gray-100 px-5 py-3 text-sm last:border-b-0"
        >
          <span class="font-medium text-gray-700">{{ attempt.lessonId?.title ?? 'Lesson' }}</span>
          <span class="text-gray-500">{{ attempt.score }}/{{ attempt.totalQuestions }} ({{ attempt.percentage }}%)</span>
        </div>
      </div>
    </template>
  </div>
</template>
