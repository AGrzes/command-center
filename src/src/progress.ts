import {Router} from 'express'
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
