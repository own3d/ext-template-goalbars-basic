<template>
  <div>
    <div
      v-if="layout === 'standard'"
      :style="{ ...titleStyle, paddingLeft: `${barInsetLeft}%`, paddingRight: `${barInsetRight}%` }"
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
        v-if="hasVideo && (values.animated || !hasImage)"
        :src="videoUrl"
        muted
        loop
        autoplay
        playsinline
        class="relative z-50 w-full h-auto"
        style="display: block;"
      />
      <img
        v-else-if="hasImage"
        class="relative z-50 w-full h-auto"
        style="display: block;"
        :src="imageUrl"
        alt=""
      >

      <!-- Background color layer -->
      <div
        class="absolute z-10"
        :style="fillAreaStyle"
      >
        <div
          class="w-full h-full"
          :style="{ background: values['bg-color'] ?? 'transparent' }"
        />
      </div>

      <!-- Fill progress layer -->
      <div
        class="absolute z-10 flex"
        :class="barDirection === 'vertical' ? 'flex-col' : 'flex-row'"
        :style="fillAreaStyle"
      >
        <div
          :style="{
            background: values['fill-color'] ?? 'transparent',
            ...(barDirection === 'vertical'
              ? { width: '100%', height: `${Math.min(percentage, 100)}%`, marginTop: 'auto' }
              : { height: '100%', width: `${Math.min(percentage, 100)}%` }),
            transition: barDirection === 'vertical' ? 'height 0.25s' : 'width 0.25s'
          }"
        />
      </div>

      <!-- Simple layout content -->
      <div
        v-if="layout === 'simple'"
        class="absolute flex items-center justify-center gap-2 z-50"
        :style="textOverlayStyle"
      >
        <div :style="[titleStyle, titleMarginStyle]">
          {{ values.title }}:
        </div>

        <div :style="[goalStyle, goalMarginStyle]">
          {{ currentGoalValue.toFixed(event === 'donation' ? 2 : 0) }} / {{ values['goal-target'].toFixed(event === 'donation' ? 2 : 0) }} ({{ percentage.toFixed(0) }}%)
        </div>
      </div>

      <!-- Standard layout content -->
      <div
        v-if="layout === 'standard'"
        class="absolute z-50 flex items-center justify-between"
        :style="[goalStyle, textOverlayStyle]"
      >
        <div :style="progressMarginStyle">
          {{ event === 'donation' ? (currentGoalValue * 100).toFixed(0) : currentGoalValue }}
        </div>

        <div :style="targetMarginStyle">
          {{ values['goal-target'] }}
        </div>
      </div>

      <!-- Condensed layout content -->
      <div
        v-if="layout === 'condensed'"
        class="absolute flex items-center justify-between gap-2 z-50"
        :style="textOverlayStyle"
      >
        <div :style="[goalStyle, progressMarginStyle]">
          {{ currentGoalValue }}
        </div>

        <div :style="[titleStyle, titleMarginStyle]">
          {{ values.title }}:
        </div>

        <div :style="[goalStyle, targetMarginStyle]">
           {{ values['goal-target'] }}
        </div>
      </div>

      <!-- Stacked layout content -->
      <div
        v-if="layout === 'stacked'"
        class="absolute flex flex-col items-center justify-center z-50"
        :style="textOverlayStyle"
      >
        <div :style="[titleStyle, titleMarginStyle]">
          {{ values.title }}
        </div>

        <div :style="[goalStyle, goalMarginStyle]">
          {{ currentGoalValue.toFixed(event === 'donation' ? 2 : 0) }} / {{ values['goal-target'].toFixed(event === 'donation' ? 2 : 0) }} ({{ percentage.toFixed(0) }}%)
        </div>
      </div>
    </div>

    <div
      v-if="layout === 'standard' && values['goal-end-date']?.toggled && (values['dates-end-show'] || values['dates-end-time-show'])"
      class="w-full"
      :style="{ ...datesStyle, paddingLeft: `${barInsetLeft}%`, paddingRight: `${barInsetRight}%` }"
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

// Bar insets (percentage-based positioning relative to the image)
// Percentages are calculated from pixel values and expected dimensions
const barInsetTopPx = computed(() => props.values?.['bar-inset-top'] ?? 38)
const barInsetRightPx = computed(() => props.values?.['bar-inset-right'] ?? 28)
const barInsetBottomPx = computed(() => props.values?.['bar-inset-bottom'] ?? 42)
const barInsetLeftPx = computed(() => props.values?.['bar-inset-left'] ?? 28)

// Expected dimensions for percentage calculation (from manifest sizing)
const expectedWidth = computed(() => props.values?.['bar-width'] ?? 800)
const expectedHeight = computed(() => props.values?.['bar-height'] ?? 200)

// Convert pixel insets to percentages
const barInsetTop = computed(() => (barInsetTopPx.value / expectedHeight.value) * 100)
const barInsetRight = computed(() => (barInsetRightPx.value / expectedWidth.value) * 100)
const barInsetBottom = computed(() => (barInsetBottomPx.value / expectedHeight.value) * 100)
const barInsetLeft = computed(() => (barInsetLeftPx.value / expectedWidth.value) * 100)

// Computed style for fill area (background and progress bar)
// Using percentages so the fill bar scales with the image
const fillAreaStyle = computed(() => {
  return `top: ${barInsetTop.value}%; right: ${barInsetRight.value}%; bottom: ${barInsetBottom.value}%; left: ${barInsetLeft.value}%;`
})

// Computed style for text overlay
const textOverlayStyle = computed(() => {
  return `top: ${barInsetTop.value}%; right: ${barInsetRight.value}%; bottom: ${barInsetBottom.value}%; left: ${barInsetLeft.value}%; padding-left: 1%; padding-right: 1%;`
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

// Staff-only settings baked in during generation (not user-configurable)
const hasImage = %hasImage%
const hasVideo = %hasVideo%
const barDirection = '%barDirection%' as 'horizontal' | 'vertical'
const titleMarginStyle = { margin: '%titleMarginTop%px %titleMarginRight%px %titleMarginBottom%px %titleMarginLeft%px' }
const goalMarginStyle = { margin: '%goalMarginTop%px %goalMarginRight%px %goalMarginBottom%px %goalMarginLeft%px' }
const progressMarginStyle = { margin: '%progressMarginTop%px %progressMarginRight%px %progressMarginBottom%px %progressMarginLeft%px' }
const targetMarginStyle = { margin: '%targetMarginTop%px %targetMarginRight%px %targetMarginBottom%px %targetMarginLeft%px' }
</script>
