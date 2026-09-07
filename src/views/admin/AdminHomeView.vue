<script setup>
import { ref, onMounted } from 'vue'

import http from '@/api/http.js'
import StatCard from '@/components/StatCard.vue'
import StatCardSkeleton from '@/components/StatCardSkeleton.vue'
import UserActivityTable from '@/components/admin/UserActivityTable.vue'

const stats = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const { stats: fetchedStats } = await http.get('/admin/stats')
    stats.value = fetchedStats
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

    <div v-if="isLoading" class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
      <StatCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <div v-else-if="stats" class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
      <StatCard label="Total Students" :value="stats.totalStudents" />
      <StatCard label="Total Lessons" :value="stats.totalLessons" />
      <StatCard label="Total Quiz Questions" :value="stats.totalQuizQuestions" />
      <StatCard label="Total Phishing Scenarios" :value="stats.totalPhishingScenarios" />
      <StatCard label="Students Completed All Lessons" :value="stats.studentsCompletedAllLessons" />
      <StatCard label="Students With Incomplete Lessons" :value="stats.studentsWithIncompleteLessons" />
    </div>

    <h2 class="mt-10 mb-4 text-lg font-semibold text-slate-900">Recent Student Activity</h2>
    <UserActivityTable />
  </div>
</template>
