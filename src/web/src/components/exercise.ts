import axios from 'axios'
import * as _ from 'lodash'
import Vue from 'vue'

type Activity = 'run' | 'pool' | 'crunches' | 'bike'
type Unit = 'session' | 'm' | 'km'
interface Goal {
  activity: Activity
  startDate: string
  dueDate: string
  target: number
  unit?: Unit
  archived: boolean
  meet?: boolean
}

interface ProgressItem {
  date: string
  increment: number
  total: number
}

interface GoalReport extends Goal {
  progress: ProgressItem[]
}

function fetch(): Promise<GoalReport> {
  return axios.get('/api/progress/exercise').then((response) => response.data)
}

Vue.component('small-exercise-widget', {
  props: ['report'],
  template: `
<div class="mb-2">
  <div class="d-flex justify-content-between">
    <p>{{report.startDate}}</p>
    <p>{{label}}</p>
    <p>{{report.dueDate}}</p>
  </div>
  <div class="progress" >
    <div class="progress-bar" role="progressbar"
      :style="{width: basePercent}"
      :aria-valuenow="base" aria-valuemin="0" :aria-valuemax="report.targ">
    </div>
    <div class="progress-bar bg-warning" role="progressbar"
      :style="{width: underPercent}"
      :aria-valuenow="base" aria-valuemin="0" :aria-valuemax="report.targ">
    </div>
    <div class="progress-bar bg-success" role="progressbar"
      :style="{width: overPercent}"
      :aria-valuenow="base" aria-valuemin="0" :aria-valuemax="report.targ">
    </div>
  </div>
</div>
  `,
  computed: {
    label() {
      return `${_.startCase(this.report.activity)} ${this.report.current}/${this.report.target} ${this.report.unit}`
    },
    base() {
      return Math.min(this.report.current, this.report.expected)
    },
    under() {
      return Math.max(this.report.current - this.report.expected, 0)
    },
    over() {
      return Math.max(this.report.expected - this.report.current, 0)
    },
    basePercent() {
      return this.base / this.report.target * 100 + '%'
    },
    overPercent() {
      return this.under / this.report.target * 100 + '%'
    },
    underPercent() {
      return this.over / this.report.target * 100 + '%'
    }

  }
})

Vue.component('exercise-widget', {
  template: `
<div>
  <h3 class="text-center">Exercise</h3>
  <small-exercise-widget :report="report"  v-for="report in reports" :key="report._id"></small-exercise-widget>
</div>
  `,
  data() {
    return {
      reports: [] as GoalReport[]
    }
  },
  mounted() {
    fetch().then((reports) => this.reports = reports)
  }
})