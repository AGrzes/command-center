import Vue from 'vue'

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
