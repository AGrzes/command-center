import axios from 'axios'
import Vue from 'vue'

function list() {
  return axios.get('/api/goals').then(response => response.data)
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

Vue.component('goal-tags', {
  props: ['tags'],
  template: '<span><span class="badge badge-primary badge-pill mr-1" v-for="tag in tags">{{tag}}</span></span>'
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
              <div class="d-flex w-100 justify-content-between align-items-center">
                <h5 class="mb-1 mr-1">{{goal.name}}</h5>
                <goal-tags :tags="goal.tags"></goal-tags>
                <goal-measurement :measurement="goal.measurement" class="ml-auto w-25 mr-4"></goal-measurement>
                <goal-result :result="goal.result"></goal-result>
              </div>
              <div class="row">
                <goal-description :description="goal.description" class="col-12 col-md-8"></goal-description>
                <goal-history :history="goal.history" class="col-12 col-md-4"></goal-history>
              </div>
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
    },
  }]
}]
