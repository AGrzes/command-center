import Vue from 'vue'

Vue.component('goal-result', {
  props: ['result'],
  template: '<small>{{result}}</small>'
})
