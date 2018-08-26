import * as moment from 'moment'
import Vue from 'vue'
import {save} from '../api'

Vue.component('goal-measure', {
  props: ['goal'],
  template: `
  <span>
    <portal to="modal">
      <div class="modal" tabindex="-1" role="dialog" ref="modal">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Measure final amount</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <div class="input-group">
                  <input type="number" class="form-control"  placeholder="Amount" v-model.number="amount">
                  <div class="input-group-append">
                    <div class="input-group-text">/ {{goal.measurement.target}}</div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <input type="date" class="form-control"  placeholder="Date" v-model="date">
              </div>
              <div class="form-group">
                <input type="text" class="form-control"  placeholder="Comment" v-model="comment">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="doMeasure()">Measure</button>
              <button type="button" class="btn btn-primary" @click="doClose()">Close</button>
            </div>
          </div>
        </div>
      </div>
    </portal>
    <a class="btn btn-primary btn-sm" @click="showModal()" v-if="active">Measure</a>
  </span>`,
  methods: {
    showModal() {
      $(this.$refs.modal).modal()
    },
    doMeasure() {
      this.goal.history.push({
        event: 'progress',
        date: this.date,
        comment: this.comment,
        amount: this.amount
      })
      this.goal.measurement.progress = this.amount
      save(this.goal)
      $(this.$refs.modal).modal('hide')
    },
    doClose() {
      this.goal.history.push({
        event: 'close',
        date: this.date,
        comment: this.comment,
        amount: this.amount
      })
      this.goal.measurement.done = this.date
      this.goal.measurement.progress = this.amount
      this.goal.result = this.amount >= this.goal.measurement.template ? 'success' : 'failure'
      save(this.goal)
      $(this.$refs.modal).modal('hide')
    }
  },
  data() {
    return {
      comment: null,
      amount: this.goal.measurement.progress,
      date: moment().format('YYYY-MM-DD')
    }
  },
  computed: {
    active() {
      return this.goal.result === 'pending' && this.goal.measurement.kind === 'amount'
    }
  }
})
