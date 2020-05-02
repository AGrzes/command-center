import PortalVue from 'portal-vue'
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
import './components'
import router from './router'
import store from './state'

Vue.use(VueApexCharts)
Vue.use(PortalVue)
Vue.component('apexcharts', VueApexCharts)

const init = async () => {
  const app = new Vue({
    el: 'body .container-fluid',
    store: await store(),
    router: await router()
  })
}
init()
