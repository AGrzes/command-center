import {Router} from 'express'
import {progress as progressDB} from './db'
export const router = Router()

router.get('/', (req, res, next) => {
  progressDB.allDocs({include_docs: true, limit: 100})
  .then((response) => response.rows.map(({doc}) => (doc)))
    .then((items) => res.send(items))
    .catch((err) => res.status(500).send(err))
})
