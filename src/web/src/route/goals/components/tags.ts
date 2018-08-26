import Vue from 'vue'

Vue.component('goal-tags', {
  props: ['tags'],
  template: '<span><span class="badge badge-primary badge-pill mr-1" v-for="tag in tags">{{tag}}</span></span>'
})
