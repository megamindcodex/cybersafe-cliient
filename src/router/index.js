import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/authStore.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: () => (useAuthStore().isAdmin ? '/admin' : '/dashboard') },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { guestOnly: true } },
    { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true, studentOnly: true } },
    { path: '/lessons', name: 'lessons', component: () => import('@/views/LessonsView.vue'), meta: { requiresAuth: true, studentOnly: true } },
    { path: '/lessons/:id', name: 'lesson-detail', component: () => import('@/views/LessonDetailView.vue'), meta: { requiresAuth: true, studentOnly: true } },
    { path: '/quiz/:lessonId', name: 'quiz', component: () => import('@/views/QuizView.vue'), meta: { requiresAuth: true, studentOnly: true } },
    { path: '/phishing-practice', name: 'phishing-practice', component: () => import('@/views/PhishingPracticeView.vue'), meta: { requiresAuth: true, studentOnly: true } },
    { path: '/progress', name: 'progress', component: () => import('@/views/ResultsView.vue'), meta: { requiresAuth: true, studentOnly: true } },
    { path: '/admin', name: 'admin-home', component: () => import('@/views/admin/AdminHomeView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/students', name: 'admin-students', component: () => import('@/views/admin/AdminStudentsView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/lessons', name: 'admin-lessons', component: () => import('@/views/admin/AdminLessonsView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/quizzes', name: 'admin-quizzes', component: () => import('@/views/admin/AdminQuizzesView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/phishing', name: 'admin-phishing', component: () => import('@/views/admin/AdminPhishingView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // On a cold load, a token may already be in localStorage but `user` (and
  // therefore `isAdmin`) hasn't been fetched yet. Every role-based check
  // below depends on `isAdmin`, so hydrate first — otherwise an admin's
  // very first navigation would evaluate `isAdmin` as false and slip past
  // the studentOnly/requiresAdmin guards before the profile fetch resolves.
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchCurrentUserRequest()
    } catch {
      authStore.logout()
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'dashboard' }
  }

  // Admins manage content — they don't take lessons/quizzes/phishing practice
  // or have personal progress, so keep them on their own dashboard.
  if (to.meta.studentOnly && authStore.isAdmin) {
    return { name: 'admin-home' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: authStore.isAdmin ? 'admin-home' : 'dashboard' }
  }

  return true
})

export default router
