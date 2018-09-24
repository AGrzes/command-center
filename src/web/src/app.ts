import * as PortalVue from 'portal-vue'
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
import router from './router'

Vue.use(VueApexCharts)
Vue.use(PortalVue)

const app = new Vue({
  el: 'body .container',
  router
})
