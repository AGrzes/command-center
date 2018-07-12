import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const routes = [{
  name: 'main',
  path: '/',
  component: {
    template: `<div>
      Hello router
    </div>`
  }
}]

const router = new VueRouter({
  mode: 'history',
  routes,
  linkActiveClass: 'active'
})

export default router
