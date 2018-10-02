import axios from 'axios'
import * as _ from 'lodash'
import { ProgressItem } from '../model/progress'

function defined(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/defined').then((response) => response.data)
}
function resolved(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/resolved').then((response) => response.data)
}
function fetch(view: string, group: string, limit: number = 100): Promise<ProgressItem[]|any> {
  return axios.get(`/api/progress/${view}`, {params: {group, limit}}).then((response) => response.data)
}

function prepareChart(name, target): (data) => any {
  return (data) => {
    target.series.push({
      data: _.map(_.reverse(data.rows), (row) => ({x: _.join(row.key, '-'), y: row.value})),
      name
    })
    target.options.xaxis = target.options.xaxis || {}
    target.options.xaxis.type = 'datetime'
  }
}

export default [{
  name: 'progress',
  path: 'progress',
  component: {
    template: `
    <div class="row">
      <div class="col-6">
        <div class="card">
          <div class="card-body">
            <apexcharts :series="daily.series" :options="daily.options" type="line"></apexcharts>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="card">
          <div class="card-body">
            <apexcharts :series="monthly.series" :options="monthly.options" type="line"></apexcharts>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="card">
          <div class="card-body">
            <apexcharts :series="quarterly.series" :options="quarterly.options" type="line"></apexcharts>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="card">
          <div class="card-body">
            <apexcharts :series="weekly.series" :options="weekly.options" type="line"></apexcharts>
          </div>
        </div>
      </div>
      <div class="col-6">
        <ul class="list-group">
          <li class="list-group-item" v-for="entry in resolved">{{entry.summary}}</li>
        </ul>
      </div>
      <div class="col-6">
        <ul class="list-group">
          <li class="list-group-item" v-for="entry in defined">{{entry.summary}}</li>
        </ul>
      </div>
    </div>
    `,
    beforeRouteEnter(to, from, next) {
      Promise.all([defined(), resolved()]).then(([definedEntries, resolvedEntries]) => {
        next((vm) => {
          vm.defined = definedEntries
          vm.resolved = resolvedEntries
        })
      })
    },
    beforeRouteUpdate(to, from, next) {
      defined().then((progress) => {
        this.defined = progress
      })
      resolved().then((entries) => {
        this.defined = entries
      })
    },
    mounted() {
      fetch('actionable:resolved', 'day', 14).then(prepareChart('Resolved daily', this.daily))
      fetch('actionable:defined', 'day', 14).then(prepareChart('Defined daily', this.daily))
      fetch('actionable:resolved', 'month', 12).then(prepareChart('Resolved monthly', this.monthly))
      fetch('actionable:defined', 'month', 12).then(prepareChart('Defined monthly', this.monthly))
      fetch('actionable:resolved', 'quarter', 12).then(prepareChart('Resolved quarterly', this.quarterly))
      fetch('actionable:defined', 'quarter', 12).then(prepareChart('Defined quarterly', this.quarterly))
      fetch('actionable:resolved', 'week', 12).then(prepareChart('Resolved weekly', this.weekly))
      fetch('actionable:defined', 'week', 12).then(prepareChart('Defined weekly', this.weekly))
    },
    data(): {
      defined: ProgressItem[],
      resolved: ProgressItem[],
      series: any,
      daily: any,
      monthly: any,
      quarterly: any,
      weekly: any} {
      return {
        defined: [],
        resolved: [],
        series: {resolvedDaily: []},
        daily: { options: {}, series: [] },
        monthly: { options: {}, series: [] },
        quarterly: { options: {}, series: [] },
        weekly: { options: {}, series: [] }
      }
    }
  }
}]
