import Vue from 'vue'

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
