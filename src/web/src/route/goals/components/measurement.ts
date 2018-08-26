import Vue from 'vue'

Vue.component('goal-measurement', {
  props: ['measurement'],
  template: `
  <div class="progress">
    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0"
      aria-valuemax="100" :style="{width: progress+'%'}">{{label}}</div>
  </div>`,
  computed: {

    progress() {
      switch (this.measurement.kind) {
        case 'pass/fail':
          return this.measurement.done ? 100 : 0
        case 'number':
        case 'amount':
          const current = this.measurement.progress || 0
          const max = this.measurement.target
          return (current / max) * 100
        default:
          return 0
      }
    },
    label() {
      switch (this.measurement.kind) {
        case 'pass/fail':
          return this.measurement.done ? 'pass' : ''
        case 'number':
        case 'amount':
          const current = this.measurement.progress || 0
          const max = this.measurement.target
          return `${current} / ${max}`
        default:
          return 0
      }
    }
  }
})
