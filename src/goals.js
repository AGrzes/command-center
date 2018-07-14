const {Router} =require('express')
const {goals:goalsDB} = require('./db')
const router = new Router()

router.get('/',(req,res,next)=>{
  goalsDB.allDocs({include_docs:true}).then(response=>response.rows.map(row=>row.doc))
  .then(goals=>res.send(goals))
  .catch((err)=>res.status(500).send(err))
})

module.exports = router
