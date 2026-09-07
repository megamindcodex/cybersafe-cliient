<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

import http from '@/api/http.js'
import { useProgressStore } from '@/stores/progressStore.js'
import PhishingMessage from '@/components/PhishingMessage.vue'

const router = useRouter()
const progressStore = useProgressStore()

const scenarios = ref([])
const currentIndex = ref(0)
const userAnswers = ref([])
const currentAnswer = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const isSubmitting = ref(false)
const result = ref(null)

const currentScenario = computed(() => scenarios.value[currentIndex.value])
const isLastScenario = computed(() => currentIndex.value === scenarios.value.length - 1)
const isCurrentCorrect = computed(() => currentAnswer.value !== null && (currentAnswer.value === 'PHISHING') === currentScenario.value?.isPhishing)

onMounted(async () => {
  try {
    const { scenarios: fetchedScenarios } = await http.get('/phishing')
    scenarios.value = fetchedScenarios
  } catch {
    loadError.value = 'Unable to load phishing practice. Please try again.'
  } finally {
    isLoading.value = false
  }
})

const handleAnswer = (answer) => {
  currentAnswer.value = answer
  userAnswers.value.push({ scenarioId: currentScenario.value.id ?? currentScenario.value._id, answer })
}

const goNext = () => {
  currentAnswer.value = null
  currentIndex.value += 1
}

const submitPractice = async () => {
  isSubmitting.value = true

  try {
    result.value = await http.post('/phishing/submit', { answers: userAnswers.value })
    await progressStore.fetchProgressRequest()
  } catch (error) {
    loadError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-6 text-2xl font-bold text-slate-900">Phishing Practice</h1>

    <p v-if="loadError" class="text-red-600">{{ loadError }}</p>

    <template v-else-if="isLoading">
      <Skeleton width="8rem" height="0.875rem" class="mb-4" />
      <div class="rounded-lg border border-gray-200 bg-white">
        <div class="border-b border-gray-100 p-5">
          <Skeleton width="4rem" height="0.75rem" />
          <Skeleton width="60%" height="1.25rem" class="mt-2" />
        </div>
        <div class="space-y-2 p-5">
          <Skeleton width="70%" height="0.875rem" />
          <Skeleton width="80%" height="0.875rem" />
          <Skeleton width="100%" height="5rem" borderRadius="0.375rem" />
        </div>
        <div class="border-t border-gray-100 p-5">
          <div class="flex gap-3">
            <Skeleton width="100%" height="2.5rem" />
            <Skeleton width="100%" height="2.5rem" />
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="result" class="rounded-lg border border-gray-200 bg-white p-8 text-center">
      <h2 class="text-xl font-bold text-slate-900">Phishing Practice Complete</h2>
      <p class="mt-6 text-sm text-gray-500">Score: {{ result.score }}/{{ result.total }}</p>
      <p class="mt-1 text-3xl font-bold text-blue-600">{{ result.percentage }}%</p>
      <p class="mt-4 text-gray-600">You correctly identified {{ result.score }} out of {{ result.total }} simulated phishing attempts.</p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button label="Back to Dashboard" @click="router.push({ name: 'dashboard' })" />
      </div>
    </div>

    <template v-else-if="currentScenario">
      <p class="mb-4 text-sm font-medium text-gray-400">Scenario {{ currentIndex + 1 }} of {{ scenarios.length }}</p>

      <PhishingMessage
        :scenario="currentScenario"
        :answered="currentAnswer !== null"
        :is-correct="isCurrentCorrect"
        @answer="handleAnswer"
      />

      <div v-if="currentAnswer !== null" class="mt-6 flex justify-end">
        <Button v-if="!isLastScenario" label="Next Scenario" @click="goNext" />
        <Button v-else label="Finish Practice" :loading="isSubmitting" @click="submitPractice" />
      </div>
    </template>
  </div>
</template>
