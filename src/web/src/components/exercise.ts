import axios from 'axios'
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

Vue.component('exercise-widget', {
  template: `
<div>
  <div class="progress" v-for="report in reports">
    <div class="progress-bar" role="progressbar"
      :style="{width: report.current/report.target * 100 + '%'}"
      :aria-valuenow="report.current" aria-valuemin="0" :aria-valuemax="report.targ">
        {{report.current}}/{{report.target}}
    </div>
  </div>
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
