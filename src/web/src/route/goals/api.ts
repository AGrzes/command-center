import axios from 'axios'

export function list() {
  return axios.get('/api/goals').then((response) => response.data)
}

export function item(id) {
  return axios.get(`/api/goals/${id}`).then((response) => response.data)
}

export function save(goal) {
  return axios.put(`/api/goals/${goal._id}`, goal).then((response) => response.data)
}

export function create() {
  return axios.post(`/api/goals/`, {measurement: {}}).then((response) => response.data)
}
