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
  <div class="progress">
    <div class="progress-bar" role="progressbar"
      style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
  </div>
</div>
  `,
  data() {
    return {
      report: [] as GoalReport[]
    }
  },
  mounted() {
    fetch().then((report) => this.report = report)
  }
})
