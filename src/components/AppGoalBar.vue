<template>
  <div>
    <div
      v-if="layout === 'standard'"
      class="px-[2.7vw]"
      :style="titleStyle"
    >
      {{ values.title }}
    </div>

    <div
      class="relative overflow-hidden"
      :class="{
        '-my-2': layout === 'standard' && values.title,
      }"
    >
      <video
        v-if="values.animated"
        :src="videoUrl"
        muted
        loop
        autoplay
        playsinline
        class="relative z-50"
      />
      <img
        v-else
        class="relative z-50"
        style="width: 100%;"
        :src="imageUrl"
        alt=""
      >

      <div
        class="absolute top-[3.5vw] left-[3.5vw] h-[8.5vw] w-[calc(100%_-_7vw)] z-10"
        :style="{
          background: values['bg-color'] ?? 'transparent'
        }"
      />

      <div class="absolute top-[3.5vw] left-[3.5vw] h-[8.5vw] w-[calc(100%_-_7vw)] z-10">
        <div
          class="left-0 top-0 h-full"
          :style="{
            background: values['fill-color'] ?? 'transparent',
            width: `${Math.min(percentage, 100)}%`,
            transition: 'width 0.25s'
          }"
        />
      </div>

      <div
        v-if="layout === 'simple'"
        class="absolute flex items-center justify-center gap-2 top-[3.7vw] left-0 h-[7.9vw] w-full px-[7vw] z-50"
      >
        <div :style="titleStyle">
          {{ values.title }}:
        </div>

        <div :style="goalStyle">
          {{ currentGoalValue.toFixed(event === 'donation' ? 2 : 0) }} / {{ values['goal-target'].toFixed(event === 'donation' ? 2 : 0) }} ({{ percentage.toFixed(0) }}%)
        </div>
      </div>

      <div
        v-if="layout === 'standard'"
        class="absolute top-[3.7vw] left-0 w-full h-[7.9vw] z-50 flex items-center justify-between px-[7vw]"
        :style="goalStyle"
      >
        <div>
          {{ event === 'donation' ? (currentGoalValue * 100).toFixed(0) : currentGoalValue }}
        </div>
  
        <div>
          {{ values['goal-target'] }}
        </div>
      </div>


      <div
        v-if="layout === 'condensed'"
        class="absolute flex items-center justify-between gap-2 top-[3.7vw] left-0 h-[7.9vw] w-full z-50 px-[7vw]"
      >
        <div :style="goalStyle">
          {{ currentGoalValue }}
        </div>

        <div :style="titleStyle">
          {{ values.title }}:
        </div>

        <div :style="goalStyle">
           {{ values['goal-target'] }}
        </div>
      </div>
    </div>

    <div
      v-if="layout === 'standard' && values['goal-end-date']?.toggled && (values['dates-end-show'] || values['dates-end-time-show'])"
      class="w-full px-[2.7vw]"
      :style="datesStyle"
    >
      <span
        v-if="values['dates-end-show']"
        :class="{
          'mr-1': values['dates-end-time-show']
        }"
      >
        {{ dayjs(values['goal-end-date'].value).format(values['dates-format-date']) }}
      </span>
      <span v-if="values['dates-end-time-show']">
        {{ dayjs(values['goal-end-date'].value).format(values['dates-format-time']) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  currentGoalValue: {
    type: Number,
    required: true
  },
  values: {
    type: Object,
    required: true
  }
})

const event = computed(() => {
  return props.values['event']
})

const percentage: ComputedRef<number> = computed(() => {
  return (props.currentGoalValue / props.values['goal-target']) * 100
})

const layout = computed(() => {
  return props.values.layout?.[0] ?? 'standard'
})

const assetBase = import.meta.env.BASE_URL

// Use fixed "custom" style - the uploaded bar image/video
const imageUrl = computed(() => {
  return `${assetBase}images/bars/custom.png`
})

const videoUrl = computed(() => {
  return `${assetBase}videos/bars/custom.webm`
})


const titleStyle = computed(() => {
  if (!props.values?.['title-font']) {
    return
  }

  return getTextStyle(props.values?.['title-font'])
})

const goalStyle = computed(() => {
  if (!props.values?.['target-font']) {
    return
  }

  return getTextStyle(props.values?.['target-font'])
})

const datesStyle = computed(() => {
  if (!props.values?.['dates-font']) {
    return
  }

  return getTextStyle(props.values?.['dates-font'])
})

function getTextStyle(settings: any) {
  return {
    fontSize: `${settings['font-size'] ?? 18}px`,
    color: settings['font-color'] ?? 'white',
    fontStyle: settings['font-style'] ?? 'normal',
    textAlign: settings['text-align'] ?? 'left',
    fontFamily: settings['font-family'] ?? 'Arial',
    fontWeight: settings['font-weight'] ?? 'normal',
    lineHeight: settings['line-height'] ?? '1',
    textIndent: settings['text-indent'] ? `${settings['text-indent']}px` : '0',
    letterSpacing: settings['letter-spacing'] ? `${settings['letter-spacing']}px` : '1',
  }
}
</script>
