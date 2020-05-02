import moment from 'moment'
import Vue from 'vue'
import {save} from '../api'

Vue.component('goal-pass', {
  props: ['goal'],
  template: `
  <span>
    <portal to="modal">
      <div class="modal" tabindex="-1" role="dialog" ref="modal">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Pass goal</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <input type="text" class="form-control"  placeholder="Comment" v-model="comment">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="pass()">Pass</button>
            </div>
          </div>
        </div>
      </div>
    </portal>
    <a class="btn btn-primary btn-sm" @click="showModal()" v-if="active">Pass</a>
  </span>`,
  methods: {
    showModal() {
      $(this.$refs.modal).modal()
    },
    pass() {
      this.goal.history.push({
        event: 'close',
        date: moment().toISOString(),
        comment: this.comment
      })
      this.goal.measurement.done = moment().toISOString()
      this.goal.result = 'success'
      save(this.goal)
      $(this.$refs.modal).modal('hide')
    }
  },
  data() {
    return {
      comment: null
    }
  },
  computed: {
    active() {
      return this.goal.result === 'pending' && this.goal.measurement.kind === 'pass/fail'
    }
  }
})
