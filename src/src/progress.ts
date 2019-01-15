import {Router} from 'express'
import addWsMethod from 'express-ws/lib/add-ws-method'
import * as _ from 'lodash'
import * as moment from 'moment'
import {progress as progressDB} from './db'
export const router = Router()
addWsMethod(router)

router.ws('/updates', (ws, req) => {
  const changes = progressDB.changes({since: 'now', live: true})
    .on('change', (change) => ws.send(JSON.stringify(change)))
    .on('complete', () => ws.close(1000))
    .on('error', (error) => ws.close(1011, JSON.stringify(error)))
  ws.on('close', () => changes.cancel())
  ws.on('error', () => changes.cancel())
})

router.get('/', (req, res, next) => {
  progressDB.allDocs({include_docs: true, limit: 100})
  .then((response) => response.rows.map(({doc}) => (doc)))
    .then((items) => res.send(items))
    .catch((err) => res.status(500).send(err))
})
type DataIn = Array<{key: string[], value: number}>
type DataOut = Array<{key: string, value: number}>
function last(unit: moment.unitOfTime.DurationConstructor, count: number, data: DataIn): DataOut {
  const result = []
  let target = { key: moment().endOf(unit).format('YYYY-MM-DD'), value: 0}
  let sourceOffset = 0
  while ( result.length < count) {
    if (sourceOffset < data.length &&
      moment(data[sourceOffset].key.join('-')).endOf(unit).format('YYYY-MM-DD') === target.key) {
      target.value += data[sourceOffset].value
      sourceOffset++
    } else {
      result.push(target)
      target = { key: moment().subtract(result.length, unit).endOf(unit).format('YYYY-MM-DD'), value: 0}
    }
  }
  return result
}

router.get('/:query', (req, res) => {
  const limit = req.query.limit || 100
  switch (req.query.group) {
    case 'day':
    progressDB.query(`queries/${req.params.query}`, {
      limit, descending: true, group: true, group_level: 3
    })
      .then((items) => res.send({rows: last('day', limit, items.rows)}))
      .catch((err) => res.status(500).send(err))
    break
    case 'month':
    progressDB.query(`queries/${req.params.query}`, {
      limit, descending: true, group: true, group_level: 2
    })
      .then((items) => res.send({rows: last('month', limit, items.rows)}))
      .catch((err) => res.status(500).send(err))
    break
    case 'quarter':
    progressDB.query(`queries/${req.params.query}`, {
      limit: limit * 3, descending: true, group: true, group_level: 2
    })
      .then((items) => {
        return {
          rows: last('quarter', limit, items.rows)
        }
      })
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
    break
    case 'week':
    progressDB.query(`queries/${req.params.query}`, {
      limit: limit * 7, descending: true, group: true, group_level: 3
    })
      .then((items) => {
        return {
          rows: last('week', limit, items.rows)
        }
      })
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
    break

    case 'year':
    progressDB.query(`queries/${req.params.query}`, {
      limit, descending: true, group: true, group_level: 1
    })
      .then((items) => res.send({rows: last('year', limit, items.rows)}))
      .catch((err) => res.status(500).send(err))
    break
    default:
    progressDB.query(`queries/${req.params.query}`, {include_docs: true, limit, descending: true, reduce: false})
    .then((response) => response.rows.map(({doc}) => (doc)))
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
  }

})
