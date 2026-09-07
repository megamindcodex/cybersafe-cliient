<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Skeleton from 'primevue/skeleton'

import { useProgressStore } from '@/stores/progressStore.js'
import ProgressCard from '@/components/ProgressCard.vue'
import ProgressCardSkeleton from '@/components/ProgressCardSkeleton.vue'

const progressStore = useProgressStore()
const { progress, quizAttempts } = storeToRefs(progressStore)

const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    await Promise.all([progressStore.fetchProgressRequest(), progressStore.fetchQuizAttemptsRequest()])
  } catch {
    loadError.value = 'Unable to load your progress. Please try again.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Your Progress</h1>

    <p v-if="loadError" class="mt-8 text-red-600">{{ loadError }}</p>

    <template v-else-if="isLoading">
      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProgressCardSkeleton v-for="n in 4" :key="n" />
      </div>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Completed Lessons</h2>
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div v-for="n in 2" :key="n" class="border-b border-gray-100 px-5 py-3 last:border-b-0">
          <Skeleton width="10rem" height="1rem" />
        </div>
      </div>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Recent Quiz Attempts</h2>
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div v-for="n in 3" :key="n" class="flex items-center justify-between border-b border-gray-100 px-5 py-3 last:border-b-0">
          <Skeleton width="8rem" height="1rem" />
          <Skeleton width="5rem" height="1rem" />
        </div>
      </div>
    </template>

    <template v-else-if="progress">
      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProgressCard
          label="Lessons"
          :percentage="progress.totalLessons ? Math.round((progress.lessonsCompleted / progress.totalLessons) * 100) : 0"
          :detail="`${progress.lessonsCompleted} / ${progress.totalLessons} completed`"
        />
        <ProgressCard label="Quiz Average" :percentage="progress.quizAverage" :detail="`${progress.quizzesCompleted} quizzes completed`" />
        <ProgressCard label="Phishing Practice" :percentage="progress.phishingScore" />
        <ProgressCard label="Overall Progress" :percentage="progress.overallPercentage" />
      </div>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Completed Lessons</h2>
      <div v-if="progress.completedLessons.length === 0" class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No lessons completed yet.
      </div>
      <ul v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <li
          v-for="lesson in progress.completedLessons"
          :key="lesson.id ?? lesson._id"
          class="border-b border-gray-100 px-5 py-3 text-sm text-gray-700 last:border-b-0"
        >
          {{ lesson.title }}
        </li>
      </ul>

      <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Recent Quiz Attempts</h2>
      <div v-if="quizAttempts.length === 0" class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No quiz attempts yet. Complete your first quiz to see your results here.
      </div>
      <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div
          v-for="attempt in quizAttempts"
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
