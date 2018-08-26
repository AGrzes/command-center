import Vue from 'vue'

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
      <goal-measure :goal="goal" class="mr-1"></goal-measure>
      <goal-archive :goal="goal" class="mr-1"></goal-archive>
      <router-link tag="a" class="btn btn-primary btn-sm mr-1"
        :to="{name:'goals.details',params: { id: goal._id }}">+</router-link>
    </div>
    <div class="row" v-if="expanded">
      <goal-description :description="goal.description" class="col-12 col-md-6"></goal-description>
      <goal-links :links="goal.links" class="col-12 col-md-3"></goal-links>
      <goal-history :history="goal.history" class="col-12 col-md-3"></goal-history>
    </div>
  </div>
  `
})
