import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import http, { AUTH_TOKEN_STORAGE_KEY } from '@/api/http.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY))

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  const setSession = (sessionUser, sessionToken) => {
    user.value = sessionUser
    token.value = sessionToken
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, sessionToken)
  }

  const loginRequest = async ({ email, password }) => {
    const { user: loggedInUser, token: authToken } = await http.post('/auth/login', { email, password })
    setSession(loggedInUser, authToken)
  }

  const registerRequest = async ({ name, email, password }) => {
    const { user: registeredUser, token: authToken } = await http.post('/auth/register', { name, email, password })
    setSession(registeredUser, authToken)
  }

  const fetchCurrentUserRequest = async () => {
    const { user: currentUser } = await http.get('/auth/me')
    user.value = currentUser
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  }

  return { user, token, isAuthenticated, isAdmin, loginRequest, registerRequest, fetchCurrentUserRequest, logout }
})
