import axios from 'axios'
import Vue from 'vue'

function list() {
  return axios.get('/api/goals').then(response => response.data)
}
function item(id) {
  return axios.get(`/api/goals/${id}`).then(response => response.data)
}

Vue.component('goal-description', {
  props: ['description'],
  template: '<p class="mb-1" v-if="description">{{ description }}</p>'
})

Vue.component('goal-result', {
  props: ['result'],
  template: '<small>{{result}}</small>'
})

Vue.component('goal-measurement', {
  props: ['measurement'],
  template: `
  <div class="progress">
    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: progress+'%'}"></div>
  </div>`,
  computed: {

    progress: function () {
      switch (this.measurement.kind) {
        case 'pass/fail':
          return this.measurement.done ? 100 : 0
        default:
          return 0;
      }
    }
  }
})

Vue.component('goal-history', {
  props: ['history'],
  template: `
  <ul>
    <li v-for="event in history">
    {{event.date}} - {{event.event}}
    </li>
  </ul>
  `
})
Vue.component('goal-links', {
  props: ['links'],
  template: `
  <ul class="list-unstyled">
    <li v-for="link in links">
    {{link.kind}}: <a :href="link.target">{{link.label}}</a>
    </li>
  </ul>
  `
})

Vue.component('goal-tags', {
  props: ['tags'],
  template: '<span><span class="badge badge-primary badge-pill mr-1" v-for="tag in tags">{{tag}}</span></span>'
})

Vue.component('goal-item', {
  props: ['goal'],
  data: ()=> ({
    expanded:false
  }),
  template: `
  <div>
    <div class="d-flex w-100 justify-content-between align-items-center">
      <h5 class="mb-1 mr-1">{{goal.name}}</h5>
      <goal-tags :tags="goal.tags"></goal-tags>
      <goal-measurement :measurement="goal.measurement" class="ml-auto w-25 mr-4"></goal-measurement>
      <goal-result :result="goal.result" class="mr-1"></goal-result>
      <a @click="expanded=!expanded" class="btn btn-primary btn-sm mr-1">{{expanded?'V':'>'}}</a>
      <router-link tag="a" class="btn btn-primary btn-sm" :to="{name:'goals.details',params: { id: goal._id }}">+</router-link>
    </div>
    <div class="row" v-if="expanded">
      <goal-description :description="goal.description" class="col-12 col-md-6"></goal-description>
      <goal-links :links="goal.links" class="col-12 col-md-3"></goal-links>
      <goal-history :history="goal.history" class="col-12 col-md-3"></goal-history>
    </div>
  </div>
  `
})

Vue.component('goal-details', {
  props: ['goal'],
  template: `
  <form>
    <div class="form-group row">
      <label for="name" class="col-sm-2 col-form-label">Name</label>
      <div class="col-sm-10">
        <input type="text" class="form-control" id="name" v-model="goal.name">
      </div>
    </div>
    <div class="form-group row">
      <label for="description" class="col-sm-2 col-form-label">Description</label>
      <div class="col-sm-10">
        <textarea type="text" class="form-control" id="description" v-model="goal.description"></textarea>
      </div>
    </div>
  </form>
  `
})

export default [{
  name: 'goals',
  path: 'goals',
  component: {
    template: `<router-view class="mt-1"></router-view>`
  },
  children: [{
    name: 'goals.list',
    path: '',
    component: {
      template: `<div class="row">
        <div class="col-12">
          <ul class="list-group">
            <li class="list-group-item" v-for="goal in goals">
              <goal-item :goal="goal"></goal-item>
            </li>
          </ul>
        </div>
      </div>
      `,
      beforeRouteEnter(to, from, next) {
        list().then(goals => next(vm => {
          vm.goals = goals
        }))
      },
      beforeRouteUpdate(to, from, next) {
        list().then(goals => {
          this.goals = goals
        })
      },
      data: () => ({
        goals: []
      })
    }
  },{
    name: 'goals.details',
    path: ':id',
    props: true,
    component: {
      props: ['id'],
      template: `
        <goal-details v-if="goal" :goal="goal"></goal-details>
      `,
      beforeRouteEnter(to, from, next) {
        next(vm => {
          item(vm.id).then(goal => {
            vm.goal = goal
          })
        })
      },
      beforeRouteUpdate(to, from, next) {
        item(this.id).then(goal => {
          this.goal = goal
        })
      },
      data: () => ({
        goal: null
      })
    },
  }]
}]
