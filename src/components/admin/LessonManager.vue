<script setup>
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import IconPencil from '@primevue/icons/pencil'
import IconTrash from '@primevue/icons/trash'

import http from '@/api/http.js'

const categoryOptions = ['PHISHING', 'PASSWORDS', 'SOCIAL_ENGINEERING', 'MALWARE', 'ONLINE_SAFETY', 'PUBLIC_WIFI']

const confirm = useConfirm()
const toast = useToast()

const lessons = ref([])
const isLoading = ref(true)
const isDialogVisible = ref(false)
const isSaving = ref(false)
const editingLessonId = ref(null)

const emptyForm = () => ({ title: '', category: null, description: '', content: '', keyPoints: '', estimatedMinutes: 5 })
const form = reactive(emptyForm())

const loadLessons = async () => {
  isLoading.value = true
  const { lessons: fetchedLessons } = await http.get('/lessons')
  lessons.value = fetchedLessons
  isLoading.value = false
}

onMounted(loadLessons)

const openCreateDialog = () => {
  editingLessonId.value = null
  Object.assign(form, emptyForm())
  isDialogVisible.value = true
}

const openEditDialog = (lesson) => {
  editingLessonId.value = lesson.id ?? lesson._id
  Object.assign(form, {
    title: lesson.title,
    category: lesson.category,
    description: lesson.description,
    content: lesson.content,
    keyPoints: lesson.keyPoints.join(', '),
    estimatedMinutes: lesson.estimatedMinutes,
  })
  isDialogVisible.value = true
}

const saveLesson = async () => {
  isSaving.value = true

  const payload = {
    title: form.title,
    category: form.category,
    description: form.description,
    content: form.content,
    estimatedMinutes: form.estimatedMinutes,
    keyPoints: form.keyPoints
      .split(',')
      .map((point) => point.trim())
      .filter(Boolean),
  }

  try {
    if (editingLessonId.value) {
      await http.put(`/lessons/${editingLessonId.value}`, payload)
    } else {
      await http.post('/lessons', payload)
    }

    toast.add({ severity: 'success', summary: 'Lesson saved', life: 3000 })
    isDialogVisible.value = false
    await loadLessons()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Could not save lesson', detail: error.message, life: 4000 })
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (lesson) => {
  confirm.require({
    message: `Delete "${lesson.title}"? This cannot be undone.`,
    header: 'Delete Lesson',
    acceptProps: { severity: 'danger', label: 'Delete' },
    accept: async () => {
      try {
        await http.delete(`/lessons/${lesson.id ?? lesson._id}`)
        toast.add({ severity: 'success', summary: 'Lesson deleted', life: 3000 })
        await loadLessons()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Could not delete lesson', detail: error.message, life: 4000 })
      }
    },
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex justify-end">
      <Button label="New Lesson" @click="openCreateDialog" />
    </div>

    <DataTable :value="lessons" :loading="isLoading" dataKey="id">
      <Column field="title" header="Title" />
      <Column field="category" header="Category" />
      <Column field="estimatedMinutes" header="Minutes" />
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

    <Dialog v-model:visible="isDialogVisible" modal :header="editingLessonId ? 'Edit Lesson' : 'New Lesson'" style="width: 32rem">
      <form class="flex flex-col gap-4" @submit.prevent="saveLesson">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Title</label>
          <InputText v-model="form.title" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Category</label>
          <Select v-model="form.category" :options="categoryOptions" placeholder="Select a category" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <Textarea v-model="form.description" rows="2" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Content</label>
          <Textarea v-model="form.content" rows="6" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Key Points (comma-separated)</label>
          <Textarea v-model="form.keyPoints" rows="2" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Estimated Minutes</label>
          <InputNumber v-model="form.estimatedMinutes" :min="1" />
        </div>

        <Button type="submit" label="Save Lesson" :loading="isSaving" />
      </form>
    </Dialog>
  </div>
</template>
