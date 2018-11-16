import {Router} from 'express'
import * as _ from 'lodash'
import * as moment from 'moment'
import {progress as progressDB} from './db'
export const router = Router()

router.get('/', (req, res, next) => {
  progressDB.allDocs({include_docs: true, limit: 100})
  .then((response) => response.rows.map(({doc}) => (doc)))
    .then((items) => res.send(items))
    .catch((err) => res.status(500).send(err))
})
router.get('/:query', (req, res) => {
  const limit = req.query.limit || 100
  switch (req.query.group) {
    case 'day':
    progressDB.query(`queries/${req.params.query}`, {
      limit, descending: true, group: true, group_level: 3
    })
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
    break
    case 'month':
    progressDB.query(`queries/${req.params.query}`, {
      limit, descending: true, group: true, group_level: 2
    })
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
    break
    case 'quarter':
    progressDB.query(`queries/${req.params.query}`, {
      limit: limit * 3, descending: true, group: true, group_level: 2
    })
      .then((items) => {
        return {
          rows: _.map(_.groupBy(items.rows, (row) => {
            const monthYear = moment(_.join(row.key, '-'))
            return `${monthYear.endOf('quarter').format('YYYY-MM-DD')}`
          }), (rows, key) => ({key: [key], value: _(rows).map('value').sum()}))
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
          rows: _.map(_.groupBy(items.rows, (row) => {
            const monthYear = moment(_.join(row.key, '-'))
            return `${monthYear.weekYear()}W${monthYear.week()}`
          }), (rows, key) => ({key: [key], value: _(rows).map('value').sum()}))
        }
      })
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
    break

    case 'year':
    progressDB.query(`queries/${req.params.query}`, {
      limit, descending: true, group: true, group_level: 1
    })
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
    break
    default:
    progressDB.query(`queries/${req.params.query}`, {include_docs: true, limit, descending: true, reduce: false})
    .then((response) => response.rows.map(({doc}) => (doc)))
      .then((items) => res.send(items))
      .catch((err) => res.status(500).send(err))
  }

})
