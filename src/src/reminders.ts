import {Router} from 'express'
import * as marked from 'marked'
import {reminders as remindersDB} from './db'
export const router = Router()

router.get('/', (req, res, next) => {
  remindersDB.allDocs({include_docs: true})
  .then((response) => response.rows.map(({
    doc: {
      name,
      content
    }}) => ({
      name,
      content: content ? marked(content) : null
    })))
    .then((reminders) => res.send(reminders))
    .catch((err) => res.status(500).send(err))
})
