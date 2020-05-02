import moment from 'moment'
import Vue from 'vue'
import {save} from '../api'

Vue.component('goal-increment', {
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
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">{{goal.measurement.progress}} + </div>
                  </div>
                  <input type="number" class="form-control"  placeholder="Increment" v-model.number="increment">
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
              <button type="button" class="btn btn-primary" @click="doIncrement()">Increment</button>
            </div>
          </div>
        </div>
      </div>
    </portal>
    <a class="btn btn-primary btn-sm" @click="showModal()" v-if="active">Increment</a>
  </span>`,
  methods: {
    showModal() {
      $(this.$refs.modal).modal()
    },
    doIncrement() {
      if (this.goal.measurement.target <= this.goal.measurement.progress + this.increment) {
        this.goal.history.push({
          event: 'close',
          date: this.date,
          comment: this.comment,
          amount: this.increment
        })
        this.goal.measurement.done = this.date
        this.goal.measurement.progress += this.increment
        this.goal.result = 'success'
      } else {
        this.goal.history.push({
          event: 'progress',
          date: this.date,
          comment: this.comment,
          amount: this.increment
        })
        this.goal.measurement.progress += this.increment
      }
      save(this.goal)
      $(this.$refs.modal).modal('hide')
    }
  },
  data() {
    return {
      comment: null,
      increment: 0,
      date: moment().format('YYYY-MM-DD')
    }
  },
  computed: {
    active() {
      return this.goal.result === 'pending' && this.goal.measurement.kind === 'number'
    }
  }
})
