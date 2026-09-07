<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Drawer from 'primevue/drawer'

import { useAuthStore } from '@/stores/authStore.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible'])

const authStore = useAuthStore()
const { isAdmin } = storeToRefs(authStore)

// Admins manage content and view platform stats — they don't get the
// student learning nav at all, only their own management pages.
const navItems = computed(() => {
  if (isAdmin.value) {
    return [
      { to: '/admin', label: 'Home' },
      { to: '/admin/students', label: 'Students' },
      { to: '/admin/lessons', label: 'Lessons' },
      { to: '/admin/quizzes', label: 'Quiz Questions' },
      { to: '/admin/phishing', label: 'Phishing Scenarios' },
    ]
  }

  return [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/lessons', label: 'Lessons' },
    { to: '/phishing-practice', label: 'Phishing Practice' },
    { to: '/progress', label: 'Progress' },
  ]
})

const closeMobileSidebar = () => emit('update:visible', false)

// A named handler (instead of two inline statements in the template) so the
// click attribute is a single expression — immune to editors reformatting
// it across lines and breaking the template compiler's inline-expression parser.
const handleMobileNavClick = (navigate) => {
  navigate()
  closeMobileSidebar()
}
</script>

<template>
  <div class="flex h-full">
    <nav class="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-100 md:flex">
      <div class="px-6 py-5 text-lg font-semibold tracking-tight">ESUT CyberSafe</div>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        v-slot="{ isActive, navigate }"
        custom
      >
        <a
          :href="item.to"
          class="mx-3 mb-1 block rounded-md px-3 py-2 text-sm font-medium transition-colors"
          :class="
            isActive
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          "
          @click="navigate"
        >
          {{ item.label }}
        </a>
      </RouterLink>
    </nav>

    <Drawer
      :visible="props.visible"
      @update:visible="emit('update:visible', $event)"
      header="ESUT CyberSafe"
    >
      <nav class="flex flex-col">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          v-slot="{ isActive, navigate }"
          custom
        >
          <a
            :href="item.to"
            class="mb-1 block rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="isActive ? 'bg-slate-700 text-white' : 'text-slate-700 hover:bg-slate-100'"
            @click.prevent="handleMobileNavClick(navigate)"
          >
            {{ item.label }}
          </a>
        </RouterLink>
      </nav>
    </Drawer>
  </div>
</template>
