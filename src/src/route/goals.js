import axios from 'axios'

function list() {
  return axios.get('/api/goals').then(response => response.data)
}

export default [{
  name: 'goals',
  path: 'goals',
  component: {
    template: `<div class="row">
      <div class="col-12">
        <table class="table">
          <tr>
            <th>AOC</th>
            <th>Project</th>
            <th>Goals</th>
          </tr>
          <tr v-for="goal in goals">
            <td>{{goal.aoc}} </td>
            <td>{{goal.project.name}} </td>
            <td>{{goal.target}} </td>
          </tr>
        </table>
      </div>
    </div>
    `,
    beforeRouteEnter(to, from, next) {
      list().then(goals => next(vm => {
        vm.goals = goals
      }))
    },
    beforeRouteUpdate(to, from, next) {
      list().then(goals => {
        this.goals = goals
      })
    },
    data: () => ({
      goals: []
    })
  }
}]
