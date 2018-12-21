import axios from 'axios'
import * as _ from 'lodash'
import moment = require('moment')
import Vue from 'vue'
import { Line, mixins } from 'vue-chartjs'
import { ProgressItem } from '../model/progress'
interface Query {
  view: string
  label?: string
  color?: string
  params: {
    [key: string]: string | number | boolean
  }
}

const colors = ['#04e762', '#e3170a', '#eac435', '#00a6a6', '#ec0868']
function nthColor(n: number): string {
  return colors[n % colors.length]
}

Vue.component('progress-chart', {
  extends: Line,
  mixins: [mixins.reactiveData],
  props: ['queries', 'timeUnit'],
  data() {
    return {
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: this.timeUnit || 'day'
            },
            ticks: {
              source: 'data'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
      }},
      chartData: {
        datasets: []
      }
    }
  },
  mounted() {
    _(this.queries).forEach((query: Query) => axios.get(`/api/progress/${query.view}`, {params: query.params})
      .then((response) => response.data).then((data) => this.chartData = {
          datasets: [...this.chartData.datasets, {
          label: query.label || query.view,
          cubicInterpolationMode: 'monotone',
          fill: false,
          backgroundColor: query.color || nthColor(this.chartData.datasets.length),
          borderColor: query.color || nthColor(this.chartData.datasets.length),
          borderWidth: 5,
          data: _(data.rows).reverse().map((row) => ({
            x: row.key,
            y: row.value
          })).value()
        }]
      }))
  }
})

function defined(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/defined').then((response) => response.data)
}
function resolved(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/resolved').then((response) => response.data)
}
const resolvedColor = '#37ff8b'
const definedColor = '#ff3845'
export default [{
  name: 'progress',
  path: 'progress',
  component: {
    template: `
    <div class="row">
      <div class="col-12 col-md-8 col-lg-6 mb-4">
        <div class="row">
        <div class="col-12 col-xl-6 mb-4">
          <div class="card">
            <div class="card-body">
              <exercise-widget></exercise-widget>
            </div>
          </div>
        </div>
          <div class="col-12 col-xl-6 mb-4">
            <div class="card">
              <div class="card-body">
                <progress-chart :queries="[
                  {view: 'actionable:resolved',label:'Resolved Daily',color:'${resolvedColor}',
                    params: {group: 'day',limit: 14}},
                  {view: 'actionable:defined',label:'Defined Daily',color:'${definedColor}',
                    params: {group: 'day',limit: 14}}]">
                </progress-chart>
              </div>
            </div>
          </div>
          <div class="col-12 col-xl-6 mb-4">
            <div class="card">
              <div class="card-body">
                <progress-chart timeUnit="week" :queries="[
                  {view: 'actionable:resolved',label:'Resolved Weekly',color:'${resolvedColor}',
                    params: {group: 'week',limit: 12}},
                  {view: 'actionable:defined',label:'Defined Weekly',color:'${definedColor}',
                    params: {group: 'week',limit: 12}}]">
                </progress-chart>
              </div>
            </div>
          </div>
          <div class="col-12 col-xl-6 mb-4">
            <div class="card">
              <div class="card-body">
                <progress-chart timeUnit="month" :queries="[
                  {view: 'actionable:resolved',label:'Resolved Monthly',color:'${resolvedColor}',
                    params: {group: 'month',limit: 12}},
                  {view: 'actionable:defined',label:'Defined Monthly',color:'${definedColor}',
                    params: {group: 'month',limit: 12}}]">
                </progress-chart>
              </div>
            </div>
          </div>
          <div class="col-12 col-xl-6 mb-4">
            <div class="card">
              <div class="card-body">
                <progress-chart timeUnit="quarter" :queries="[
                  {view: 'actionable:resolved',label:'Resolved Quarterly',color:'${resolvedColor}',
                    params: {group: 'quarter',limit: 12}},
                  {view: 'actionable:defined',label:'Defined Quarterly',color:'${definedColor}',
                    params: {group: 'quarter',limit: 12}}]">
                </progress-chart>
              </div>
            </div>
          </div>
          <div class="col-12 col-xl-6 mb-4">
            <div class="card">
              <div class="card-body">
                <progress-chart timeUnit="month" :queries="[
                  {view: 'projects:resolved',label:'Projects Resolved Monthly',color:'${resolvedColor}',
                    params: {group: 'month',limit: 12}},
                  {view: 'projects:defined',label:' ProjectsDefined Monthly',color:'#ea526f',
                    params: {group: 'month',limit: 12}}]">
                </progress-chart>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4 col-lg-6 mb-4 order-md-first">
        <div class="row">
          <div class="col-12 col-xl-6">
            <ul class="list-group">
            <li class="list-group-item py-1 list-group-item-primary" ><h3>Resolved</h3></li>
              <template v-for="(entries,day) in resolved">
                <li class="list-group-item py-1 list-group-item-info" ><strong>{{day}}</strong></li>
                <li class="list-group-item py-1" v-for="entry in entries">
                  <span class="badge badge-primary mr-1" v-for="label in filterLabels(entry.labels)">{{label}}</span>
                  {{entry.summary}}
                </li>
              </template>
            </ul>
          </div>
          <div class="col-12 col-xl-6">
            <ul class="list-group">
              <li class="list-group-item py-1 list-group-item-primary" ><h3>Defined</h3></li>
              <template v-for="(entries,day) in defined">
                <li class="list-group-item py-1 list-group-item-info" ><strong>{{day}}</strong></li>
                <li class="list-group-item py-1" v-for="entry in entries">
                  <span class="badge badge-primary mr-1" v-for="label in filterLabels(entry.labels)">{{label}}</span>
                  {{entry.summary}}
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
    `,
    beforeRouteEnter(to, from, next) {
      Promise.all([defined(), resolved()]).then(([definedEntries, resolvedEntries]) => {
        next((vm) => {
          vm.defined = _.groupBy(definedEntries, (entry) => moment(entry.defined).format('YYYY-MM-DD'))
          vm.resolved = _.groupBy(resolvedEntries, (entry) => moment(entry.resolved).format('YYYY-MM-DD'))
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
    data(): {
      defined: ProgressItem[],
      resolved: ProgressItem[]
    } {
      return {
        defined: [],
        resolved: []
      }
    },
    methods: {
      filterLabels(labels: string[]) {
        return _.intersection(labels, ['jira', 'github'])
      }
    }
  }
}]
