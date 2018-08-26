import * as $ from 'jquery'
import * as _ from 'lodash'
import * as moment from 'moment'
import Vue from 'vue'
import {create, item, list, save} from './api'
import './components'

Vue.component('goal-archive', {
  props: ['goal'],
  template: `
  <span>
    <a class="btn btn-primary btn-sm" @click="doArchive()" v-if="active">Archive</a>
  </span>`,
  methods: {
    doArchive() {
      this.goal.history.push({
        event: 'archive',
        date: moment().toISOString()
      })
      this.goal.measurement.done = moment().toISOString()
      this.goal.archive = true
      save(this.goal)
    }
  },
  computed: {
    active() {
      return (this.goal.result === 'success' || this.goal.result === 'failure') && !this.goal.archive
    }
  }
})

Vue.component('goals-archive', {
  props: ['goals'],
  template: `
  <span>
    <portal to="modal">
      <div class="modal" tabindex="-1" role="dialog" ref="modal">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Archive Goals</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <input type="date" class="form-control"  placeholder="Date" v-model="date">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="doArchive()">Archive</button>
            </div>
          </div>
        </div>
      </div>
    </portal>
    <a class="btn btn-primary btn-sm" @click="showModal()">Archive</a>
  </span>`,
  methods: {
    showModal() {
      $(this.$refs.modal).modal()
    },
    doArchive() {
      this.goals.forEach((goal) => {
        if (!goal.archive && goal.measurement.done && moment(goal.measurement.done).isSameOrBefore(this.date, 'day')) {
          goal.history.push({
            event: 'archive',
            date: moment().toISOString()
          })
          goal.measurement.done = moment().toISOString()
          goal.archive = true
          save(goal)
        }
      })
      $(this.$refs.modal).modal('hide')
    }
  },
  data() {
    return {
      date: moment().format('YYYY-MM-DD')
    }
  }
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
