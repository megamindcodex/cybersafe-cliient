<script setup>
import Button from 'primevue/button'
import Message from 'primevue/message'

const props = defineProps({
  scenario: { type: Object, required: true },
  answered: { type: Boolean, default: false },
  isCorrect: { type: Boolean, default: null },
})

const emit = defineEmits(['answer'])
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="border-b border-gray-100 p-5">
      <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ scenario.type }}</p>
      <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ scenario.title }}</h3>
    </div>

    <div class="space-y-2 p-5 text-sm">
      <p><span class="font-medium text-gray-500">From:</span> {{ scenario.sender }}</p>
      <p><span class="font-medium text-gray-500">Subject:</span> {{ scenario.subject }}</p>
      <p class="whitespace-pre-line rounded-md bg-gray-50 p-3 text-gray-700">{{ scenario.message }}</p>
    </div>

    <div class="border-t border-gray-100 p-5">
      <template v-if="!answered">
        <p class="mb-3 text-sm font-medium text-gray-700">What do you think?</p>
        <div class="flex gap-3">
          <Button label="This is Safe" severity="success" outlined class="flex-1" @click="emit('answer', 'SAFE')" />
          <Button label="This is Phishing" severity="danger" outlined class="flex-1" @click="emit('answer', 'PHISHING')" />
        </div>
      </template>

      <template v-else>
        <Message :severity="isCorrect ? 'success' : 'error'" :closable="false">
          {{ isCorrect ? 'Correct!' : 'Not quite.' }}
          This message {{ scenario.isPhishing ? 'is phishing' : 'is safe' }}.
        </Message>

        <div v-if="scenario.redFlags?.length" class="mt-3">
          <p class="text-sm font-medium text-gray-700">Red flags:</p>
          <ul class="mt-1 list-inside list-disc text-sm text-gray-600">
            <li v-for="flag in scenario.redFlags" :key="flag">{{ flag }}</li>
          </ul>
        </div>

        <p class="mt-3 text-sm text-gray-600">{{ scenario.explanation }}</p>
      </template>
    </div>
  </div>
</template>
