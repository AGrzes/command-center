import axios from 'axios'
import * as _ from 'lodash'
import moment = require('moment')
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

function fetch(): Promise<GoalReport[]> {
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
  <div class="row">
    <div class="col-12">
      <big-exercise-widget-chart :chartData="chartData" :title="label"></big-exercise-widget-chart>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <button type="button" @click="toggleTable()" class="btn btn-secondary btn-block">
        <template v-if="showTable">hide table</template><template v-else>show table</template>
      </button>
    </div>
  </div>
  <div class="row mt-4" v-if="showTable">
    <div class="col-12">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Increment</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in report.progress">
            <td>{{row.date}}</td>
            <td>{{row.increment}}</td>
            <td>{{row.total}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
  computed: {
    label() {
      return `${_.startCase(this.report.activity)}`
    }
  },
  methods: {
    toggleTable() {
      this.showTable = !this.showTable
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
      },
      showTable: false
    }
  }
})

Vue.component('exercise-card', {
  template: `
<div class="col-12 mb-4" :class="{'col-xl-12':expanded, 'col-xl-6':!expanded}">
  <div class="card">
    <div class="card-body">
      <exercise-widget @expand="expand" @collapse="collapse"></exercise-widget>
    </div>
  </div>
</div>
  `,
  data() {
    return {
      expanded: false
    }
  },
  methods: {
    collapse() {
      this.expanded = false
    },
    expand() {
      this.expanded = true
    }
  }
})

Vue.component('exercise-widget', {
  template: `
<div>
  <div class="row">
    <h3 class="col-4 offset-4 text-center">Exercise
    </h3>
    <div class="col-4 text-right">
      <button type="button" @click="toggle()" class="btn btn-secondary">
        <template v-if="expanded">collapse</template><template v-else>expand</template>
      </button>
    </div>
  </div>
  <div v-if="expanded">
    <div class="row" >
      <ul class="nav nav-tabs col-12">
        <li class="nav-item">
          <a class="nav-link" :class="{active: tab==='current'}" @click="tab = 'current'">Current</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{active: tab==='archived'}" @click="tab = 'archived'">Archived</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{active: tab==='future'}" @click="tab = 'future'">Future</a>
        </li>
      </ul>
    </div>
    <div class="row" v-if="tab==='current'">
      <div class="col-12 col-md-6" v-for="report in current" :key="report._id + '-big'">
        <big-exercise-widget :report="report"></big-exercise-widget>
      </div>
    </div>
    <div class="row" v-if="tab==='archived'">
    <div class="modal" tabindex="-1" role="dialog" ref="detailsModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Details</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <big-exercise-widget :report="reportToShow" v-if="reportToShow"></big-exercise-widget>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
      <div class="col-12">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Activity</th>
              <th>Target</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in archived">
              <td>{{report.startDate}}</td>
              <td>{{report.dueDate}}</td>
              <td>{{report.activity}}</td>
              <td>{{report.target}} {{report.unit}}</td>
              <td>{{report.current}} {{report.unit}}</td>
              <td><button type="button" class="btn btn-primary" @click="details(report)">Details</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="row" v-if="tab==='future'">
      <div class="col-12">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Activity</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in future">
              <td>{{report.startDate}}</td>
              <td>{{report.dueDate}}</td>
              <td>{{report.activity}}</td>
              <td>{{report.target}} {{report.unit}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="row" v-else>
    <div class="col-12" v-for="report in current" :key="report._id + '-small'">
      <small-exercise-widget :report="report"></small-exercise-widget>
    </div>
  </div>
</div>
  `,
  methods: {
    toggle() {
      this.expanded = !this.expanded
      if (this.expanded) {
        this.$emit('expand')
      } else {
        this.$emit('collapse')
      }
    },
    details(report: GoalReport) {
      this.reportToShow = report
      $(this.$refs.detailsModal).modal()
    }
  },
  data() {
    return {
      current: [] as GoalReport[],
      future: [] as GoalReport[],
      archived: [] as GoalReport[],
      expanded: false,
      tab: 'current',
      reportToShow: null
    }
  },
  mounted() {
    fetch().then((reports) => {
      const now = moment()
      this.current = _.filter(reports, (report: GoalReport) => !report.archived && now.isSameOrAfter(report.startDate))
      this.archived = _.filter(reports, (report: GoalReport) => report.archived)
      this.future = _.filter(reports, (report: GoalReport) => !report.archived && now.isBefore(report.startDate))
    })
  }
})
