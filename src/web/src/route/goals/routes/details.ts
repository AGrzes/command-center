import {item} from '../api'

export default {
  name: 'goals.details',
  path: ':id',
  props: true,
  component: {
    props: ['id'],
    template: `
      <goal-details v-if="goal" :goal="goal"></goal-details>
    `,
    beforeRouteEnter(to, from, next) {
      next((vm) => {
        item(vm.id).then((goal) => {
          vm.goal = goal
        })
      })
    },
    beforeRouteUpdate(to, from, next) {
      item(this.id).then((goal) => {
        this.goal = goal
      })
    },
    data: () => ({
      goal: null
    })
  }
}
