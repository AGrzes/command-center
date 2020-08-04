import Vue from 'vue'
import VueRouter from 'vue-router'
import goals from './route/goals'
import progress from './route/progress'
import references from './route/references'
import reminders from './route/reminders'
Vue.use(VueRouter)
async function router() {
  const routes = [{
    name: 'main',
    path: '/',
    component: {
      template: `<div>
        <div class="row mt-1">
          <div class="col-12">
            <nav class="navbar navbar-light bg-light navbar-expand-lg">
              <a class="navbar-brand" href="#">Command Center</a>
              <button class="navbar-toggler" type="button" data-toggle="collapse"
                data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                  <router-link tag="li" class="nav-item" :to="{name:'goals.list'}">
                    <a class="nav-link">Goals</a>
                  </router-link>
                  <router-link tag="li" class="nav-item" :to="{name:'reminders'}">
                    <a class="nav-link">Reminders</a>
                  </router-link>
                  <router-link tag="li" class="nav-item" :to="{name:'progress'}">
                    <a class="nav-link">Progress</a>
                  </router-link>
                  <router-link tag="li" class="nav-item" :to="{name:'references'}">
                    <a class="nav-link">References</a>
                  </router-link>
                </ul>
              </div>
            </nav>
          </div>
        </div>
        <router-view class="mt-1"></router-view>
      </div>`
    },
    children: [
      ...goals,
      ...reminders,
      ...progress,
      await references()
    ]
  }]

  return new VueRouter({
    mode: 'history',
    routes,
    linkActiveClass: 'active'
  })

}

export default router
