import * as $ from 'jquery'
import * as _ from 'lodash'
import * as moment from 'moment'
import Vue from 'vue'
import {create, item, list, save} from './api'
import './components'

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
      template: `
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <goals-archive :goals="goals"></goals-archive>
              <div class="form-check form-check-inline" v-for="tag in tags">
                <input class="form-check-input" type="checkbox" :id="'tag-'+tag" :value="tag" v-model="selectedTags">
                <label class="form-check-label" :for="'tag-'+tag">{{tag}}</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="showArchived" v-model="showArchived">
                <label class="form-check-label" for="showArchived">Show archived</label>
              </div>
              <a class="btn btn-primary btn-sm" @click="newGoal()">New</a>
            </div>
          </div>
        </div>
        <div class="col-12 mt-1">
          <ul class="list-group">
            <li class="list-group-item" v-for="goal in goals">
              <goal-item :goal="goal"></goal-item>
            </li>
          </ul>
        </div>
      </div>
      `,
      beforeRouteEnter(to, from, next) {
        list().then((goals) => next((vm) => {
          vm.rawGoals = goals
        }))
      },
      beforeRouteUpdate(to, from, next) {
        list().then((goals) => {
          this.rawGoals = goals
        })
      },
      data: () => ({
        rawGoals: [],
        selectedTags: [],
        showArchived: false
      }),
      computed: {
        tags() {
          return _.uniq(_.flatMap(this.rawGoals, 'tags'))
        },
        goals() {
          return _.filter(this.rawGoals, (goal) => (
              _.isEmpty(this.selectedTags) || !_.isEmpty(_.intersection(goal.tags, this.selectedTags))) &&
            (this.showArchived ? true : !goal.archive))
        }
      },
      methods: {
        newGoal() {
          create().then((response) => this.$router.push({ name: 'goals.details', params: { id: response.id }}))
        }
      }
    }
  }, {
    name: 'goals.details',
    path: ':id',
    props: true,
    component: {
      props: ['id'],
      template: `
        <goal-details v-if="goal" :goal="goal"></goal-details>
      `,
      beforeRouteEnter(to, from, next) {
        next((vm) => {
          item(vm.id).then((goal) => {
            vm.goal = goal
          })
        })
      },
      beforeRouteUpdate(to, from, next) {
        item(this.id).then((goal) => {
          this.goal = goal
        })
      },
      data: () => ({
        goal: null
      })
    }
  }]
}]
