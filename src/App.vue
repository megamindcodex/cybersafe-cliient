<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

import { useAuthStore } from '@/stores/authStore.js'
import AppNavbar from '@/components/AppNavbar.vue'
import Sidebar from '@/components/Sidebar.vue'

// Auth rehydration (fetchCurrentUserRequest, on a cold load with a stored
// token) happens in the router's beforeEach guard, not here — the guard's
// role-based redirects need `user` populated before they evaluate, and
// running it there instead of in a separate onMounted avoids a race where
// a route's meta check would run before this component ever mounts.
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const isMobileSidebarOpen = ref(false)
</script>

<template>
  <Toast />
  <ConfirmDialog />

  <div v-if="isAuthenticated" class="flex h-screen bg-gray-50">
    <Sidebar v-model:visible="isMobileSidebarOpen" />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppNavbar @toggle-sidebar="isMobileSidebarOpen = true" />
      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <router-view />
      </main>
    </div>
  </div>

  <div v-else class="flex min-h-screen items-center justify-center bg-slate-900 p-4">
    <router-view />
  </div>
</template>
