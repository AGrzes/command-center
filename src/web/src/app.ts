import * as PortalVue from 'portal-vue'
import Vue from 'vue'
import router from './router'

Vue.use(PortalVue)

const app = new Vue({
  el: 'body .container',
  router
})
