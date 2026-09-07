<script setup>
import UserActivityTable from '@/components/admin/UserActivityTable.vue'
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Students</h1>
    <p class="mt-1 text-gray-500">Every registered student, with their quiz average and phishing practice score.</p>

    <div class="mt-6">
      <UserActivityTable />
    </div>
  </div>
</template>
