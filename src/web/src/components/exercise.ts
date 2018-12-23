import axios from 'axios'
import * as _ from 'lodash'
import Vue from 'vue'
import { Line, mixins } from 'vue-chartjs'

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
Vue.component('big-exercise-widget-chart', {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['title'],
  data() {
    return {
      options: {
        title: {
          display: true,
          text: this.title
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'day'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
      }}
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.options)
  }
})

Vue.component('big-exercise-widget', {
  props: ['report'],
  template: `
<div class="mb-2">
  <big-exercise-widget-chart :chartData="chartData" :title="label"></big-exercise-widget-chart>
</div>
  `,
  computed: {
    label() {
      return `${_.startCase(this.report.activity)}`
    }
  },
  data() {
    return {
      chartData: {
        datasets: [{
          label: `Progres (${this.report.unit})`,
          cubicInterpolationMode: 'monotone',
          fill: false,
          backgroundColor: '#6eeb83',
          borderColor: '#6eeb83',
          borderWidth: 5,
          data: _(this.report.progress).map((row: ProgressItem) => ({
            x: row.date,
            y: row.total
          })).value()
        }, {
          label: `Target (${this.report.unit})`,
          cubicInterpolationMode: 'monotone',
          fill: false,
          backgroundColor: '#f74f65',
          borderColor: '#f74f65',
          borderWidth: 5,
          data: [{x: this.report.startDate, y: 0}, {x: this.report.dueDate, y: this.report.target}]
        }, {
          label: `Projected (${this.report.unit})`,
          cubicInterpolationMode: 'monotone',
          fill: false,
          backgroundColor: '#ffbc42',
          borderColor: '#ffbc42',
          borderWidth: 5,
          data: [{x: this.report.startDate, y: 0}, {x: this.report.dueDate, y: this.report.projected}]
        }]
      }
    }
  }
})

Vue.component('exercise-widget', {
  template: `
<div>
  <h3 class="text-center" @click="expanded = !expanded">Exercise</h3>
  <div class="row" v-if="expanded">
    <div class="col-12 col-md-6" v-for="report in reports" :key="report._id + '-big'">
      <big-exercise-widget :report="report"></big-exercise-widget>
    </div>
  </div>
  <div class="row" v-else>
    <div class="col-12" v-for="report in reports" :key="report._id + '-small'">
      <small-exercise-widget :report="report"></small-exercise-widget>
    </div>
  </div>
</div>
  `,
  data() {
    return {
      reports: [] as GoalReport[],
      expanded: false
    }
  },
  mounted() {
    fetch().then((reports) => this.reports = reports)
  }
})
