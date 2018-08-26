import * as moment from 'moment'
import Vue from 'vue'
import {save} from '../api'

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
