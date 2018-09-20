import axios from 'axios'
import { ProgressItem } from '../model/progress'

function defined(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/defined').then((response) => response.data)
}
function resolved(): Promise<ProgressItem[]> {
  return axios.get('/api/progress/resolved').then((response) => response.data)
}

export default [{
  name: 'progress',
  path: 'progress',
  component: {
    template: `
    <div class="row">
      <div class="col-6">
        <ul class="list-group">
          <li class="list-group-item" v-for="entry in resolved">{{entry.summary}}</li>
        </ul>
      </div>
      <div class="col-6">
        <ul class="list-group">
          <li class="list-group-item" v-for="entry in defined">{{entry.summary}}</li>
        </ul>
      </div>
    </div>
    `,
    beforeRouteEnter(to, from, next) {
      Promise.all([defined(), resolved()]).then(([definedEntries,resolvedEntries])=>{
        next((vm) => {
          vm.defined = definedEntries
          vm.resolved = resolvedEntries
        })
      })
    },
    beforeRouteUpdate(to, from, next) {
      defined().then((progress) => {
        this.defined = progress
      })
      resolved().then((entries) => {
        this.defined = entries
      })
    },
    data(): {defined: ProgressItem[], resolved: ProgressItem[]} {
      return {
        defined: [],
        resolved: []
      }
    }
  }
}]
