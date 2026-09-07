<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import IconBars from '@primevue/icons/bars'

import { useAuthStore } from '@/stores/authStore.js'

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8">
    <div class="flex items-center gap-3">
      <div class="md:hidden">
        <Button text rounded severity="secondary" @click="emit('toggle-sidebar')">
          <template #icon><IconBars style="width: 1.25rem; height: 1.25rem" /></template>
        </Button>
      </div>
      <span class="text-sm text-gray-500">Welcome back, <span class="font-semibold text-gray-800">{{ user?.name }}</span></span>
    </div>

    <Button label="Logout" text severity="secondary" @click="handleLogout" />
  </header>
</template>
