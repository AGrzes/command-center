import axios from 'axios'
import Vue from 'vue'
import moment from 'moment'
import _ from 'lodash'

function list() {
  return axios.get('/api/goals').then(response => response.data)
}

function item(id) {
  return axios.get(`/api/goals/${id}`).then(response => response.data)
}

function save(goal) {
  return axios.put(`/api/goals/${goal._id}`, goal).then(response => response.data)
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
    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: progress+'%'}">{{label}}</div>
  </div>`,
  computed: {

    progress() {
      switch (this.measurement.kind) {
        case 'pass/fail':
          return this.measurement.done ? 100 : 0
        case 'number':
        case 'amount':
          const current = this.measurement.progress || 0
          const max = this.measurement.target
          return (current / max) * 100
        default:
          return 0;
      }
    },
    label() {
      switch (this.measurement.kind) {
        case 'pass/fail':
          return this.measurement.done ? 'pass' : ''
        case 'number':
        case 'amount':
          const current = this.measurement.progress || 0
          const max = this.measurement.target
          return `${current} / ${max}`
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
      if (this.goal.measurement.target <= this.goal.measurement.progress + this.increment){
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

Vue.component('goal-item', {
  props: ['goal'],
  data: () => ({
    expanded: false
  }),
  template: `
  <div>
    <div class="d-flex w-100 justify-content-between align-items-center">
      <h5 class="mb-1 mr-1">{{goal.name}}</h5>
      <goal-tags :tags="goal.tags"></goal-tags>
      <goal-measurement :measurement="goal.measurement" class="ml-auto w-25 mr-4"></goal-measurement>
      <goal-result :result="goal.result" class="mr-1"></goal-result>
      <a @click="expanded=!expanded" class="btn btn-primary btn-sm mr-1">{{expanded?'V':'>'}}</a>
      <goal-pass :goal="goal" class="mr-1"></goal-pass>
      <goal-increment :goal="goal" class="mr-1"></goal-increment>
      <goal-archive :goal="goal" class="mr-1"></goal-archive>
      <router-link tag="a" class="btn btn-primary btn-sm mr-1" :to="{name:'goals.details',params: { id: goal._id }}">+</router-link>
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
    doSave(){
      save(this.goal)
    },
    addTag(){
      this.goal.tags = this.goal.tags || []
      this.goal.tags.push(this.newTag)
      this.newTag = null
    },
    removeTag(index){
      this.goal.tags.splice(index,1)
    },
    addLink(){
      this.goal.links = this.goal.links || []
      this.goal.links.push(this.newLink)
      this.newLink = {}
    },
    removeLink(index){
      this.goal.links.splice(index,1)
    },
    addEvent(){
      this.goal.history = this.goal.history || []
      this.goal.history.push({})
    },
    removeEvent(index){
      this.goal.history.splice(index,1)
    }
  },
  data(){
    return {
      newTag: null,
      newLink: {}
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
      this.goals.forEach((goal)=>{
        if (!goal.archive && goal.measurement.done && moment(goal.measurement.done).isSameOrBefore(this.date,'day')){
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
        list().then(goals => next(vm => {
          vm.rawGoals = goals
        }))
      },
      beforeRouteUpdate(to, from, next) {
        list().then(goals => {
          this.rawGoals = goals
        })
      },
      data: () => ({
        rawGoals: [],
        selectedTags:[],
        showArchived: false
      }),
      computed:{
        tags(){
          return _.uniq(_.flatMap(this.rawGoals,'tags'))
        },
        goals(){
          return _.filter(this.rawGoals,(goal)=>(
            _.isEmpty(this.selectedTags)||!_.isEmpty(_.intersection(goal.tags,this.selectedTags)))&& 
            (this.showArchived?true:!goal.archive))
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
