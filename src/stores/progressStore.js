import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

export const useProgressStore = defineStore('progress', () => {
  const progress = ref(null)
  const quizAttempts = ref([])

  const fetchProgressRequest = async () => {
    const { progress: fetchedProgress } = await http.get('/progress')
    progress.value = fetchedProgress
  }

  const fetchQuizAttemptsRequest = async () => {
    const { attempts } = await http.get('/progress/quiz-attempts')
    quizAttempts.value = attempts
  }

  const completeLessonRequest = async (lessonId) => {
    const { progress: updatedProgress } = await http.post(`/progress/lesson/${lessonId}/complete`)
    progress.value = updatedProgress
  }

  return { progress, quizAttempts, fetchProgressRequest, fetchQuizAttemptsRequest, completeLessonRequest }
})
