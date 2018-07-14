import Vue from 'vue'
import VueRouter from 'vue-router'
import goals from './route/goals'
Vue.use(VueRouter)
const routes = [{
  name: 'main',
  path: '/',
  component: {
    template: `<div>
      <div class="row">
        <div class="col-12">
          <nav class="navbar navbar-light bg-light navbar-expand-lg">
            <a class="navbar-brand" href="#">Command Center</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <router-link tag="li" class="nav-item" :to="{name:'goals'}">Goals</router-link>
              </ul>
            </div>
          </nav>
        </div>
      </div>
      <router-view></router-view>
    </div>`
  },
  children: [
    ...goals
  ]
}]

const router = new VueRouter({
  mode: 'history',
  routes,
  linkActiveClass: 'active'
})

export default router
