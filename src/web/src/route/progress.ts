import axios from 'axios'
import { ChartScales, ChartTitleOptions, TickOptions } from 'chart.js'
import * as _ from 'lodash'
import moment = require('moment')
import Vue from 'vue'
import { Line, mixins } from 'vue-chartjs'
import { ProgressItem } from '../model/progress'
import { WS } from '../util/ws'
interface Query {
  view: string
  label?: string
  color?: string
  additional?: any
  params: {
    [key: string]: string | number | boolean
  }
}

interface ChartSettings {
  queries: Query[]
  scales?: ChartScales
  title?: ChartTitleOptions
}

const colors = ['#04e762', '#e3170a', '#eac435', '#00a6a6', '#ec0868']
function nthColor(n: number): string {
  return colors[n % colors.length]
}

Vue.component('progress-chart', {
  extends: Line,
  mixins: [mixins.reactiveData],
  props: ['queries', 'scales', 'title'],
  data() {
    const scales: ChartScales = this.scales || {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'day'
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
    }
    return {
      options: {
        scales,
        title: this.title
      },
      chartData: {
        datasets: []
      }
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    fetch() {
      Promise.all(_.map(this.queries, (query: Query) => axios.get(`/api/progress/${query.view}`, {params: query.params})
      .then((response) => response.data).then((data) => ({
        label: query.label || query.view,
        cubicInterpolationMode: 'monotone',
        fill: false,
        backgroundColor: query.color || nthColor(this.chartData.datasets.length),
        borderColor: query.color || nthColor(this.chartData.datasets.length),
        borderWidth: 5,
        data: _(data.rows).reverse().map((row) => ({
          x: row.key,
          y: row.value
        })).value(),
        ...(query.additional || {})
      })
    ))).then((datasets) => this.chartData = {datasets})
    }
  },
  created() {
    this.$root.$on('changed:progress', this.fetch)
  },
  beforeDestroy() {
    this.$root.$off('changed:progress', this.fetch)
  }
})

function defined(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/defined').then((response) => response.data)
}
function resolved(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/resolved').then((response) => response.data)
}

function mapProgressItem(item: ProgressItem): ProgressItem {
  const supported = _.find(item.related, ({relation}) => relation === 'supports')
  if (supported) {
    item.parent = supported.target.summary
  }
  const repository = _.find(item.related, ({relation}) => relation === 'repository')
  if (repository) {
    item.parent = repository.target.summary
  }
  return item
}

function mapProgressItems(items: ProgressItem[], sortProperty: string ) {
  return _(items).map(mapProgressItem).groupBy((entry) => moment(entry[sortProperty]).format('YYYY-MM-DD')).value()
}

export default [{
  name: 'progress',
  path: 'progress',
  component: Vue.extend({
    template: `
    <div class="row">
      <div class="col-12 col-md-8 col-lg-6 mb-4">
        <div class="row">
          <progress-report-card v-for="reportConfig in progressReportsConfig.reports" :config="reportConfig">
          </progress-report-card>
          <div class="col-12 col-xl-6 mb-4" v-for="chartConfig in chartConfigs">
            <div class="card">
              <div class="card-body">
                <progress-chart :queries="chartConfig.queries" :scales="chartConfig.scales" :title="chartConfig.title">
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
            <li class="list-group-item py-1 list-group-item-primary" ><h3>
              <span class="spinner-grow-sm align-middle" :class="{'spinner-grow':connected}"></span>
              Resolved
            </h3></li>
              <template v-for="(entries,day) in resolved">
                <li class="list-group-item py-1 list-group-item-info" ><strong>{{day}}</strong></li>
                <li class="list-group-item py-1" v-for="entry in entries">
                  <span class="badge badge-primary mr-1" v-for="source in selectSource(entry.labels)">{{source}}</span>
                  <span class="badge badge-warning mr-1" v-for="type in selectType(entry.labels)">{{type}}</span>
                  {{entry.summary}} <small v-if="entry.parent">{{entry.parent}}</small>
                </li>
              </template>
            </ul>
          </div>
          <div class="col-12 col-xl-6">
            <ul class="list-group">
              <li class="list-group-item py-1 list-group-item-primary" ><h3>
                <span class="spinner-grow-sm align-middle" :class="{'spinner-grow':connected}"></span>
                Defined
              </h3></li>
              <template v-for="(entries,day) in defined">
                <li class="list-group-item py-1 list-group-item-info" ><strong>{{day}}</strong></li>
                <li class="list-group-item py-1" v-for="entry in entries">
                  <span class="badge badge-primary mr-1" v-for="source in selectSource(entry.labels)">{{source}}</span>
                  <span class="badge badge-warning mr-1" v-for="type in selectType(entry.labels)">{{type}}</span>
                  {{entry.summary}} <small v-if="entry.parent">{{entry.parent}}</small>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
    `,
    data(this: any) {
      const scales: ChartScales = {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day'
          },
          ticks: {
            source: 'data'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            precision: 0
          } as TickOptions
        }]
      }
      const chartConfigs: ChartSettings[] = [..._.map([
        {params: { group: 'day', limit: 14}, title: 'Daily Actions'},
        {params: { group: 'week', limit: 14}, title: 'Weekly Actions'},
        {params: { group: 'month', limit: 12}, title: 'Monthly Actions'},
        {params: { group: 'quarter', limit: 12}, title: 'Quarterly Actions'}],
      ({params, title}) =>
        ({queries: _.map([
          {view: 'actionable:defined', label: 'Defined', color: '#ff3845'},
          {view: 'actionable:resolved', label: 'Resolved', color: '#37ff8b'}
        ],
          (queryBase) => _.assign({}, queryBase, {params})),
          scales,
          title: {
            text: title,
            display: true
          }
        })
      ), ..._.map([
        {params: { group: 'week', limit: 14}, title: 'Weekly Projects'},
        {params: { group: 'month', limit: 12}, title: 'Monthly Projects'},
        {params: { group: 'quarter', limit: 12}, title: 'Quarterly Projects'}],
      ({params, title}) =>
        ({queries: _.map([
          {view: 'projects:defined', label: 'Defined', color: '#ff3845'},
          {view: 'projects:resolved', label: 'Resolved', color: '#37ff8b'}
        ],
          (queryBase) => _.assign({}, queryBase, {params})),
          scales,
          title: {
            text: title,
            display: true
          }
        })
      )]
      this.fetch()
      const progressReportsConfig: ProgressReportsConfig = {reports: []}
      return {
        defined: [],
        resolved: [],
        chartConfigs,
        progressReportsConfig,
        ws: new WS({path: 'api/progress/updates'}),
        connected: false
      }
    },
    methods: {
      selectSource(labels: string[]) {
        return _.intersection(labels, ['jira', 'github'])
      },
      selectType(labels: string[]) {
        return _.intersection(labels, ['Action', 'Project', 'Thread', 'Condition', 'Thing', 'Activity', 'Group'])
      },
      fetch() {
        defined().then((progress) => {
          this.defined = mapProgressItems(progress, 'defined')
        })
        resolved().then((entries) => {
          this.resolved = mapProgressItems(entries, 'resolved')
        })
      }
    },
    mounted() {
      axios.get(`/api/config/progress-reports`).then(({data}) => this.progressReportsConfig = data)
    },
    created() {
      this.ws.connect()
      this.ws.message.subscribe(_.debounce(() => this.$root.$emit('changed:progress'), 1000))
      this.ws.connected.subscribe((connected: boolean) => this.connected = connected)
      this.ws.connected.subscribe(() => this.$root.$emit('changed:progress'))
      this.$root.$on('changed:progress', this.fetch)
    },
    beforeDestroy() {
      this.ws.close()
      this.$root.$off('changed:progress', this.fetch)
    }
  })
}]
