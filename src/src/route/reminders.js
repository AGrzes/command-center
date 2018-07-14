import axios from 'axios'

function list() {
  return axios.get('/api/reminders').then(response => response.data)
}

export default [{
  name: 'reminders',
  path: 'reminders',
  component: {
    template: `<div class="row">
      <div class="col-4" v-for="reminder in reminders">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{reminder.name}}</h5>
            <p class="card-text" v-html="reminder.content"></p>
          </div>
        </div>
      </div>  
    </div>
    `,
    beforeRouteEnter(to, from, next) {
      list().then(reminders => next(vm => {
        vm.reminders = reminders
      }))
    },
    beforeRouteUpdate(to, from, next) {
      list().then(reminders => {
        this.reminders = reminders
      })
    },
    data: () => ({
      reminders: []
    })
  }
}]
