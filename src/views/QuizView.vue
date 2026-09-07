<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

import http from '@/api/http.js'
import QuizQuestion from '@/components/QuizQuestion.vue'

const route = useRoute()
const router = useRouter()

const questions = ref([])
const answers = ref([])
const currentIndex = ref(0)
const isLoading = ref(true)
const loadError = ref('')
const isSubmitting = ref(false)
const result = ref(null)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)
const canProceed = computed(() => answers.value[currentIndex.value] !== null && answers.value[currentIndex.value] !== undefined)

const resultMessage = computed(() => {
  if (!result.value) return ''
  if (result.value.percentage >= 80) return 'Excellent work! You have a strong grasp of this topic.'
  if (result.value.percentage >= 60) return 'Good job. You correctly identified most of the cybersecurity risks.'
  return 'Keep practicing — review the lesson and try the quiz again.'
})

onMounted(async () => {
  try {
    const { questions: fetchedQuestions } = await http.get(`/quizzes/${route.params.lessonId}`)
    questions.value = fetchedQuestions
    answers.value = new Array(fetchedQuestions.length).fill(null)
  } catch {
    loadError.value = 'Unable to load this quiz. Please try again.'
  } finally {
    isLoading.value = false
  }
})

const selectAnswer = (optionIndex) => {
  answers.value[currentIndex.value] = optionIndex
}

const goNext = () => {
  if (!isLastQuestion.value) {
    currentIndex.value += 1
  }
}

const submitQuiz = async () => {
  isSubmitting.value = true

  try {
    result.value = await http.post(`/quizzes/${route.params.lessonId}/submit`, { answers: answers.value })
  } catch (error) {
    loadError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <p v-if="loadError" class="text-red-600">{{ loadError }}</p>

    <div v-else-if="isLoading" class="rounded-lg border border-gray-200 bg-white p-8">
      <Skeleton width="6rem" height="0.875rem" />
      <Skeleton width="80%" height="1.5rem" class="mt-3 mb-6" />
      <div class="flex flex-col gap-3">
        <Skeleton v-for="n in 4" :key="n" width="100%" height="3rem" borderRadius="0.5rem" />
      </div>
      <div class="mt-8 flex justify-end">
        <Skeleton width="6rem" height="2.5rem" />
      </div>
    </div>

    <div v-else-if="result" class="rounded-lg border border-gray-200 bg-white p-8 text-center">
      <h1 class="text-2xl font-bold text-slate-900">Quiz Complete</h1>
      <p class="mt-6 text-sm text-gray-500">Your Score</p>
      <p class="mt-1 text-4xl font-bold text-slate-900">{{ result.score }} / {{ result.totalQuestions }}</p>
      <p class="mt-1 text-2xl font-semibold text-blue-600">{{ result.percentage }}%</p>
      <p class="mt-4 text-gray-600">{{ resultMessage }}</p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button label="Review Lessons" severity="secondary" outlined @click="router.push({ name: 'lessons' })" />
        <Button label="Back to Dashboard" @click="router.push({ name: 'dashboard' })" />
      </div>
    </div>

    <div v-else-if="currentQuestion" class="rounded-lg border border-gray-200 bg-white p-8">
      <QuizQuestion
        :question="currentQuestion.question"
        :options="currentQuestion.options"
        :selected="answers[currentIndex]"
        :question-number="currentIndex + 1"
        :total-questions="questions.length"
        @select="selectAnswer"
      />

      <div class="mt-8 flex justify-end">
        <Button
          v-if="!isLastQuestion"
          label="Next"
          :disabled="!canProceed"
          @click="goNext"
        />
        <Button
          v-else
          label="Submit Quiz"
          :disabled="!canProceed"
          :loading="isSubmitting"
          @click="submitQuiz"
        />
      </div>
    </div>
  </div>
</template>
