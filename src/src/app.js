import Vue from 'vue'
import router from './router'
import PortalVue from 'portal-vue'

Vue.use(PortalVue) 

const app = new Vue({
  el: 'body .container',
  router
})
