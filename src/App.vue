<template>
  <AppGoalBar
    :values="values"
    :current-goal-value="currentGoalValue"
  />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { ofetch } from 'ofetch'
import { initializeExtension, useContext, useAuth, usePubSub } from '@own3d/sdk'
import { useFonts } from './composables/useFonts'
import AppGoalBar from './components/AppGoalBar.vue'

const extension = initializeExtension()
const { onContext } = useContext(extension)

const values: any = ref({
  title: '',
  style: 'arcadepro'
})

const sourceId = ref('')
const { loadFont } = useFonts()

onContext((context, changed) => {
  if (context.sourceId) {
    sourceId.value = context.sourceId
  }

  if (changed.includes('values')) {
    values.value = context.values

    // load font
    loadFont(values.value['dates-font']?.['font-family'])
    loadFont(values.value['title-font']?.['font-family'])
    loadFont(values.value['target-font']?.['font-family'])
  }

  sync()
})


const { onAuthorized } = useAuth(extension)
onAuthorized((auth: any) => {
  clientToken.value = auth.client_token

  sync()
})



// Sync
const clientToken = ref('')
const currentGoalValue = ref(0)

async function sync() {
  if (!clientToken.value || !sourceId.value) {
    return
  }

  const { value } = await ofetch('https://api.own3d.pro/v1/goalbars/sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clientToken.value}`,
    },
    body: {
      source_id: sourceId.value,
      extension_id: values.value.extension.id,
      event: values.value.event,
      platforms: values.value.platforms,
      start_value: values.value['goal-start'].value ? values.value['goal-start'].value ?? 0 : 0,
      goal: values.value['goal-target'],
      start_at: values.value['goal-start-date'].toggled ? values.value['goal-start-date'].value ?? null : null,
      end_at: values.value['goal-end-date'].toggled ? values.value['goal-end-date'].value ?? null : null,
    }
  })

  currentGoalValue.value = value ?? 0
}


// goalbar-update event
const { subscribe } = usePubSub(extension)
subscribe('goalbar-update', (data: any) => {
  if(data.client_id === values.value.extension.id && data.data.source_id === sourceId.value) {
    if(data.data['test-increase']) {
      currentGoalValue.value += data.data['test-increase']
    } else {
      currentGoalValue.value = data.data.value
    }
  }
})
</script>

<style>
body {
  margin: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
