<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

import { useAuthStore } from '@/stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.loginRequest({ email: email.value, password: password.value })
    router.push({ name: authStore.isAdmin ? 'admin-home' : 'dashboard' })
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <template #title>
      <div class="text-center">
        <p class="text-xl font-bold text-slate-900">ESUT CyberSafe</p>
        <p class="mt-1 text-sm font-normal text-gray-500">Cybersecurity Awareness &amp; Training</p>
      </div>
    </template>
    <template #content>
      <form class="mt-4 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium text-gray-700">Email</label>
          <InputText id="email" v-model="email" type="email" autocomplete="email" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium text-gray-700">Password</label>
          <Password id="password" v-model="password" :feedback="false" toggleMask autocomplete="current-password" fluid />
        </div>

        <Button type="submit" label="Login" :loading="isSubmitting" class="mt-2" />

        <p class="text-center text-sm text-gray-500">
          Don't have an account?
          <RouterLink to="/register" class="font-medium text-blue-600 hover:underline">Create account</RouterLink>
        </p>
      </form>
    </template>
  </Card>
</template>
