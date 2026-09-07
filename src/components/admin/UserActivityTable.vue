<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import http from '@/api/http.js'

const students = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const { users: fetchedStudents } = await http.get('/admin/users')
  students.value = fetchedStudents
  isLoading.value = false
})
</script>

<template>
  <DataTable :value="students" :loading="isLoading" dataKey="id">
    <Column field="name" header="Student" />
    <Column field="email" header="Email" />
    <Column header="Quiz Average">
      <template #body="{ data }">{{ data.quizAverage }}%</template>
    </Column>
    <Column header="Phishing Score">
      <template #body="{ data }">{{ data.phishingScore }}%</template>
    </Column>
  </DataTable>
</template>
