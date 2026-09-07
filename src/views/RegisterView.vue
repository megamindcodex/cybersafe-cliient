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

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.registerRequest({ name: name.value, email: email.value, password: password.value })
    router.push({ name: 'dashboard' })
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
        <p class="text-xl font-bold text-slate-900">Create Account</p>
        <p class="mt-1 text-sm font-normal text-gray-500">Join the ESUT CyberSafe training platform</p>
      </div>
    </template>
    <template #content>
      <form class="mt-4 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

        <div class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium text-gray-700">Full Name</label>
          <InputText id="name" v-model="name" autocomplete="name" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium text-gray-700">Email</label>
          <InputText id="email" v-model="email" type="email" autocomplete="email" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium text-gray-700">Password</label>
          <Password id="password" v-model="password" toggleMask autocomplete="new-password" fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="confirm-password" class="text-sm font-medium text-gray-700">Confirm Password</label>
          <Password id="confirm-password" v-model="confirmPassword" :feedback="false" toggleMask autocomplete="new-password" fluid />
        </div>

        <Button type="submit" label="Create Account" :loading="isSubmitting" class="mt-2" />

        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <RouterLink to="/login" class="font-medium text-blue-600 hover:underline">Log in</RouterLink>
        </p>
      </form>
    </template>
  </Card>
</template>
