import Vue from 'vue'
import {save} from './api'

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
    <div class="form-group row">
      <label for="result" class="col-sm-2 col-form-label">Result</label>
      <div class="col-sm-10">
        <select class="form-control custom-select" id="result" v-model="goal.result">
          <option>pending</option>
          <option>success</option>
          <option>failure</option>
        </select>
      </div>
    </div>
    <div class="form-group row">
      <label for="measurement.kind" class="col-sm-2 col-form-label">Measurement Kind</label>
      <div class="col-sm-10">
        <select class="form-control custom-select" id="measurement.kind" v-model="goal.measurement.kind">
          <option>pass/fail</option>
          <option>number</option>
          <option>amount</option>
        </select>
      </div>
    </div>
    <div class="form-group row" v-if="goal.measurement.kind === 'number' || goal.measurement.kind === 'amount'">
      <label for="measurement.target" class="col-sm-2 col-form-label">Measurement Target</label>
      <div class="col-sm-10">
        <input type="number" class="form-control" id="measurement.target" v-model="goal.measurement.target">
      </div>
    </div>
    <div class="form-group row" v-if="goal.measurement.kind === 'number' || goal.measurement.kind === 'amount'">
      <label for="measurement.progress" class="col-sm-2 col-form-label">Measurement Progress</label>
      <div class="col-sm-10">
        <input type="number" class="form-control" id="measurement.progress" v-model="goal.measurement.progress">
      </div>
    </div>
    <div class="form-group row">
      <label for="measurement.due" class="col-sm-2 col-form-label">Measurement Due Date</label>
      <div class="col-sm-10">
        <input type="date" class="form-control" id="measurement.due" v-model="goal.measurement.due">
      </div>
    </div>
    <div class="form-group row">
      <label for="measurement.done" class="col-sm-2 col-form-label">Measurement Done Date</label>
      <div class="col-sm-10">
        <input type="date" class="form-control" id="measurement.done" v-model="goal.measurement.done">
      </div>
    </div>
    <div class="form-group row">
      <label for="tags" class="col-sm-2 col-form-label">Tags</label>
      <div class="col-sm-10">
        <div class="input-group  mb-1" v-for="(tag,index) in goal.tags">
          <input type="text" class="form-control" id="name" v-model="goal.tags[index]">
          <div class="input-group-append">
            <button type="button" class="btn btn-primary" @click="removeTag(index)">-</button>
          </div>
        </div>
        <div class="input-group">
          <input type="text" class="form-control" id="name" v-model="newTag">
          <div class="input-group-append">
            <button type="button" class="btn btn-primary" @click="addTag()">+</button>
          </div>
        </div>
      </div>
    </div>
    <div class="form-group row">
      <label for="tags" class="col-sm-2 col-form-label">Links</label>
      <div class="col-sm-10">
        <div class="form-row mb-1" v-for="link in goal.links">
          <div class="col-12 col-md-3">
            <select class="form-control custom-select" id="kind" v-model="link.kind">
              <option>aoc</option>
              <option>project</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <input type="url" class="form-control" id="target" v-model="link.target">
          </div>
          <div class="col-12 col-md-4">
            <input type="text" class="form-control" id="label" v-model="link.label">
          </div>
          <div class="col-12 col-md-1">
            <button type="button" class="btn btn-primary form-control" @click="removeLink(index)">-</button>
          </div>
        </div>
        <div class="form-row mb-1">
          <div class="col-12 col-md-3">
            <select class="form-control custom-select" id="kind" v-model="newLink.kind">
              <option>aoc</option>
              <option>project</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <input type="url" class="form-control" id="target" v-model="newLink.target">
          </div>
          <div class="col-12 col-md-4">
            <input type="text" class="form-control" id="label" v-model="newLink.label">
          </div>
          <div class="col-12 col-md-1">
            <button type="button" class="btn btn-primary form-control" @click="addLink()">+</button>
          </div>
        </div>
      </div>
    </div>
    <div class="form-group row">
      <label for="history" class="col-sm-2 col-form-label">History</label>
      <div class="col-sm-10">
        <div class="row">
          <div class="col-12 col-md-6 mb-4" v-for="(event,index) in goal.history">
            <div class="card">
              <div class="card-body">
                <div class="form-group row">
                  <label :for="'event-kind-'+index" class="col-sm-3 col-form-label">Event</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" :id="'event-kind-'+index" v-model="event.event">
                  </div>
                </div>
                <div class="form-group row">
                  <label :for="'event-date-'+index" class="col-sm-3 col-form-label">Date</label>
                  <div class="col-sm-9">
                    <input type="date" class="form-control" :id="'event-date-'+index" v-model="event.date">
                  </div>
                </div>
                <div class="form-group row">
                  <label :for="'event-comment-'+index" class="col-sm-3 col-form-label">Comment</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" :id="'event-comment-'+index" v-model="event.comment">
                  </div>
                </div>
                <div class="form-group row">
                  <label :for="'event-amount-'+index" class="col-sm-3 col-form-label">Amount</label>
                  <div class="col-sm-9">
                    <input type="number" class="form-control" :id="'event-amount-'+index" v-model="event.amount">
                  </div>
                </div>
                <button type="button" class="btn btn-primary form-control" @click="removeEvent(index)">-</button>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-1">
            <button type="button" class="btn btn-primary form-control" @click="addEvent()">+</button>
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-primary" @click="doSave()">Save</button>
  </form>
  `,
  methods: {
    doSave() {
      save(this.goal)
    },
    addTag() {
      this.goal.tags = this.goal.tags || []
      this.goal.tags.push(this.newTag)
      this.newTag = null
    },
    removeTag(index) {
      this.goal.tags.splice(index, 1)
    },
    addLink() {
      this.goal.links = this.goal.links || []
      this.goal.links.push(this.newLink)
      this.newLink = {}
    },
    removeLink(index) {
      this.goal.links.splice(index, 1)
    },
    addEvent() {
      this.goal.history = this.goal.history || []
      this.goal.history.push({})
    },
    removeEvent(index) {
      this.goal.history.splice(index, 1)
    }
  },
  data() {
    return {
      newTag: null,
      newLink: {}
    }
  }
})
