<script setup>
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import IconPencil from '@primevue/icons/pencil'
import IconTrash from '@primevue/icons/trash'

import http from '@/api/http.js'

const confirm = useConfirm()
const toast = useToast()

const scenarios = ref([])
const isLoading = ref(true)
const isDialogVisible = ref(false)
const isSaving = ref(false)
const editingScenarioId = ref(null)

const classificationOptions = [
  { label: 'Phishing', value: true },
  { label: 'Safe', value: false },
]

const emptyForm = () => ({ title: '', sender: '', subject: '', message: '', redFlags: '', isPhishing: true, explanation: '' })
const form = reactive(emptyForm())

const loadScenarios = async () => {
  isLoading.value = true
  const { scenarios: fetchedScenarios } = await http.get('/phishing')
  scenarios.value = fetchedScenarios
  isLoading.value = false
}

onMounted(loadScenarios)

const openCreateDialog = () => {
  editingScenarioId.value = null
  Object.assign(form, emptyForm())
  isDialogVisible.value = true
}

const openEditDialog = (scenario) => {
  editingScenarioId.value = scenario.id ?? scenario._id
  Object.assign(form, {
    title: scenario.title,
    sender: scenario.sender,
    subject: scenario.subject,
    message: scenario.message,
    redFlags: scenario.redFlags.join(', '),
    isPhishing: scenario.isPhishing,
    explanation: scenario.explanation,
  })
  isDialogVisible.value = true
}

const saveScenario = async () => {
  isSaving.value = true

  const payload = {
    title: form.title,
    sender: form.sender,
    subject: form.subject,
    message: form.message,
    isPhishing: form.isPhishing,
    explanation: form.explanation,
    redFlags: form.redFlags
      .split(',')
      .map((flag) => flag.trim())
      .filter(Boolean),
  }

  try {
    if (editingScenarioId.value) {
      await http.put(`/phishing/${editingScenarioId.value}`, payload)
    } else {
      await http.post('/phishing', payload)
    }

    toast.add({ severity: 'success', summary: 'Scenario saved', life: 3000 })
    isDialogVisible.value = false
    await loadScenarios()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Could not save scenario', detail: error.message, life: 4000 })
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (scenario) => {
  confirm.require({
    message: `Delete "${scenario.title}"? This cannot be undone.`,
    header: 'Delete Phishing Scenario',
    acceptProps: { severity: 'danger', label: 'Delete' },
    accept: async () => {
      try {
        await http.delete(`/phishing/${scenario.id ?? scenario._id}`)
        toast.add({ severity: 'success', summary: 'Scenario deleted', life: 3000 })
        await loadScenarios()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Could not delete scenario', detail: error.message, life: 4000 })
      }
    },
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex justify-end">
      <Button label="New Scenario" @click="openCreateDialog" />
    </div>

    <DataTable :value="scenarios" :loading="isLoading" dataKey="id">
      <Column field="title" header="Title" />
      <Column header="Classification">
        <template #body="{ data }">
          <Tag :value="data.isPhishing ? 'Phishing' : 'Safe'" :severity="data.isPhishing ? 'danger' : 'success'" />
        </template>
      </Column>
      <Column header="Actions" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button text severity="secondary" @click="openEditDialog(data)">
              <template #icon><IconPencil style="width: 1rem; height: 1rem" /></template>
            </Button>
            <Button text severity="danger" @click="confirmDelete(data)">
              <template #icon><IconTrash style="width: 1rem; height: 1rem" /></template>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="isDialogVisible" modal :header="editingScenarioId ? 'Edit Scenario' : 'New Scenario'" style="width: 32rem">
      <form class="flex flex-col gap-4" @submit.prevent="saveScenario">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Title</label>
          <InputText v-model="form.title" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Sender</label>
          <InputText v-model="form.sender" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Subject</label>
          <InputText v-model="form.subject" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Message</label>
          <Textarea v-model="form.message" rows="4" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Red Flags (comma-separated)</label>
          <Textarea v-model="form.redFlags" rows="2" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Correct Classification</label>
          <Select v-model="form.isPhishing" :options="classificationOptions" optionLabel="label" optionValue="value" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Explanation</label>
          <Textarea v-model="form.explanation" rows="2" required />
        </div>

        <Button type="submit" label="Save Scenario" :loading="isSaving" />
      </form>
    </Dialog>
  </div>
</template>
