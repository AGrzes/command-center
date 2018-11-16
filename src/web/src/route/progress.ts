import axios from 'axios'
import * as _ from 'lodash'
import { ProgressItem } from '../model/progress'

import Vue from 'vue'
import { Line, mixins } from 'vue-chartjs'
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

interface ChartData {
  options: any
  series: Array<{
    data: Array<number|{
      x: string|number
      y: number
    }>
    name: string
  }>
}

export default [{
  name: 'progress',
  path: 'progress',
  component: {
    template: `
    <div class="row">
      <div class="col-6 mb-4">
        <div class="card">
          <div class="card-body">
            <progress-chart :queries="[
              {view: 'actionable:resolved',label:'Resolved Daily',color:'#33ca7f',params: {group: 'day',limit: 14}},
              {view: 'actionable:defined',label:'Defined Daily',color:'#f24333',params: {group: 'day',limit: 14}}]">
            </progress-chart>
          </div>
        </div>
      </div>
      <div class="col-6 mb-4">
        <div class="card">
          <div class="card-body">
            <progress-chart timeUnit="month" :queries="[
              {view: 'actionable:resolved',label:'Resolved Monthly',color:'#33ca7f',params: {group: 'month',limit: 12}},
              {view: 'actionable:defined',label:'Defined Monthly',color:'#f24333',params: {group: 'month',limit: 12}}]">
            </progress-chart>
          </div>
        </div>
      </div>
      <div class="col-6 mb-4">
        <div class="card">
          <div class="card-body">
            <progress-chart timeUnit="quarter" :queries="[
              {view: 'actionable:resolved',label:'Resolved Quarterly',color:'#33ca7f',
                params: {group: 'quarter',limit: 12}},
              {view: 'actionable:defined',label:'Defined Quarterly',color:'#f24333',
                params: {group: 'quarter',limit: 12}}]">
            </progress-chart>
          </div>
        </div>
      </div>
      <div class="col-6 mb-4">
        <div class="card">
          <div class="card-body">
            <progress-chart timeUnit="week" :queries="[
              {view: 'actionable:resolved',label:'Resolved Weekly',color:'#33ca7f',params: {group: 'week',limit: 12}},
              {view: 'actionable:defined',label:'Defined Weekly',color:'#f24333',params: {group: 'week',limit: 12}}]">
            </progress-chart>
          </div>
        </div>
      </div>
      <div class="col-6 mb-4">
        <div class="card">
          <div class="card-body">
            <progress-chart timeUnit="month" :queries="[
              {view: 'projects:resolved',label:'Projects Resolved Monthly',color:'#33ca7f',
                params: {group: 'month',limit: 12}},
              {view: 'projects:defined',label:' ProjectsDefined Monthly',color:'#f24333',
                params: {group: 'month',limit: 12}}]">
            </progress-chart>
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
    data(): {
      defined: ProgressItem[],
      resolved: ProgressItem[]
    } {
      return {
        defined: [],
        resolved: []
      }
    }
  }
}]
