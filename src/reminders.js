const {Router} = require('express')
const {reminders: remindersDB} = require('./db')
const marked = require('marked')
const router = new Router()

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

module.exports = router
