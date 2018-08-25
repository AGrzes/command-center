import {Router} from 'express'
import {reminders as remindersDB} from './db'
import * as marked from 'marked'
export const router = new Router()

router.get('/', (req, res, next) => {
  remindersDB.allDocs({include_docs: true})
  .then(response => response.rows.map(({
    doc:{
      name,
      content
    }}) => ({
      name,
      content:content ? marked(content) : null
    })))
    .then(reminders => res.send(reminders))
    .catch((err) => res.status(500).send(err))
})

