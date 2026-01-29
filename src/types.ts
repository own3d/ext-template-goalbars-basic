// Type definitions for Basic Goal Bar Extension

export interface FontSettings {
  'font-size': number
  'font-color': string
  'font-style': string
  'text-align': string
  'font-family': string
  'font-weight': string | number
  'line-height': number
  'text-indent': number
  'letter-spacing': number
}

export interface GoalBarValues {
  title: string
  event: 'follow' | 'subscribe' | 'cheer' | 'donation'
  platforms: string[]
  layout: string[]
  'goal-target': number
  'goal-start': {
    value: number
    toggled: boolean
  }
  'goal-start-date': {
    value: string
    toggled: boolean
  }
  'goal-end-date': {
    value: string
    toggled: boolean
  }
  'fill-color': string
  'bg-color': string
  'title-font': FontSettings
  'target-font': FontSettings
  'dates-font': FontSettings
  'dates-end-show': boolean
  'dates-end-time-show': boolean
  'dates-format-date': string
  'dates-format-time': string
  animated?: boolean
  extension: {
    id: string
  }
}
