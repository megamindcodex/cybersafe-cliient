<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import IconPencil from '@primevue/icons/pencil'
import IconTrash from '@primevue/icons/trash'

import http from '@/api/http.js'

const confirm = useConfirm()
const toast = useToast()

const lessons = ref([])
const selectedLessonId = ref(null)
const questions = ref([])
const isLoading = ref(false)

const isDialogVisible = ref(false)
const isSaving = ref(false)
const editingQuestionId = ref(null)

const emptyForm = () => ({
  lessonId: null,
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: null,
  explanation: '',
})
const form = reactive(emptyForm())

const answerOptions = [
  { label: 'Option A', value: 0 },
  { label: 'Option B', value: 1 },
  { label: 'Option C', value: 2 },
  { label: 'Option D', value: 3 },
]

const loadQuestions = async () => {
  if (!selectedLessonId.value) {
    questions.value = []
    return
  }

  isLoading.value = true

  try {
    const { questions: fetchedQuestions } = await http.get(`/quizzes/${selectedLessonId.value}`)
    questions.value = fetchedQuestions
  } catch {
    questions.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const { lessons: fetchedLessons } = await http.get('/lessons')
  lessons.value = fetchedLessons
  selectedLessonId.value = fetchedLessons[0]?.id ?? fetchedLessons[0]?._id ?? null
})

watch(selectedLessonId, loadQuestions)

const openCreateDialog = () => {
  editingQuestionId.value = null
  Object.assign(form, emptyForm(), { lessonId: selectedLessonId.value })
  isDialogVisible.value = true
}

const openEditDialog = async (question) => {
  const { question: fullQuestion } = await http.get(`/quizzes/question/${question.id ?? question._id}`)
  editingQuestionId.value = fullQuestion._id ?? fullQuestion.id

  Object.assign(form, {
    lessonId: selectedLessonId.value,
    question: fullQuestion.question,
    optionA: fullQuestion.options[0] ?? '',
    optionB: fullQuestion.options[1] ?? '',
    optionC: fullQuestion.options[2] ?? '',
    optionD: fullQuestion.options[3] ?? '',
    correctAnswer: fullQuestion.correctAnswer,
    explanation: fullQuestion.explanation,
  })
  isDialogVisible.value = true
}

const saveQuestion = async () => {
  isSaving.value = true

  const payload = {
    lessonId: form.lessonId,
    question: form.question,
    options: [form.optionA, form.optionB, form.optionC, form.optionD].filter((option) => option.trim() !== ''),
    correctAnswer: form.correctAnswer,
    explanation: form.explanation,
  }

  try {
    if (editingQuestionId.value) {
      await http.put(`/quizzes/${editingQuestionId.value}`, payload)
    } else {
      await http.post('/quizzes', payload)
    }

    toast.add({ severity: 'success', summary: 'Quiz question saved', life: 3000 })
    isDialogVisible.value = false
    await loadQuestions()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Could not save question', detail: error.message, life: 4000 })
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (question) => {
  confirm.require({
    message: 'Delete this quiz question? This cannot be undone.',
    header: 'Delete Quiz Question',
    acceptProps: { severity: 'danger', label: 'Delete' },
    accept: async () => {
      try {
        await http.delete(`/quizzes/${question.id ?? question._id}`)
        toast.add({ severity: 'success', summary: 'Quiz question deleted', life: 3000 })
        await loadQuestions()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Could not delete question', detail: error.message, life: 4000 })
      }
    },
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select
        v-model="selectedLessonId"
        :options="lessons"
        optionLabel="title"
        optionValue="id"
        placeholder="Select a lesson"
        class="w-full sm:w-64"
      />
      <Button label="New Question" :disabled="!selectedLessonId" @click="openCreateDialog" />
    </div>

    <DataTable :value="questions" :loading="isLoading" dataKey="id">
      <Column field="question" header="Question" />
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

    <Dialog v-model:visible="isDialogVisible" modal :header="editingQuestionId ? 'Edit Quiz Question' : 'New Quiz Question'" style="width: 32rem">
      <form class="flex flex-col gap-4" @submit.prevent="saveQuestion">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Question</label>
          <Textarea v-model="form.question" rows="2" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Option A</label>
          <InputText v-model="form.optionA" required />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Option B</label>
          <InputText v-model="form.optionB" required />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Option C</label>
          <InputText v-model="form.optionC" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Option D</label>
          <InputText v-model="form.optionD" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Correct Answer</label>
          <Select v-model="form.correctAnswer" :options="answerOptions" optionLabel="label" optionValue="value" placeholder="Select the correct option" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Explanation</label>
          <Textarea v-model="form.explanation" rows="2" required />
        </div>

        <Button type="submit" label="Save Question" :loading="isSaving" />
      </form>
    </Dialog>
  </div>
</template>
