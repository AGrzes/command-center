import axios from 'axios'
import { ProgressItem } from '../model/progress'

function list(): Promise<ProgressItem[]> {
  return axios.get('/api/progress').then((response) => response.data)
}

export default [{
  name: 'progress',
  path: 'progress',
  component: {
    template: `
    <ul class="list-group" >
      <li class="list-group-item" v-for="entry in progress">{{entry.summary}}</li>
    </ul>
    `,
    beforeRouteEnter(to, from, next) {
      list().then((progress) => next((vm) => {
        vm.progress = progress
      }))
    },
    beforeRouteUpdate(to, from, next) {
      list().then((progress) => {
        this.progress = progress
      })
    },
    data(): {progress: ProgressItem[]} {
      return {
        progress: []
      }
    }
  }
}]
