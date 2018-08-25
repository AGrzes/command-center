import {Router} from 'express'
import {json} from 'body-parser'
import {goals as goalsDB} from './db'
export const router = new Router()

router.get('/',(req,res,next)=>{
  goalsDB.allDocs({include_docs:true}).then(response=>response.rows.map(row=>row.doc))
  .then(goals=>res.send(goals))
  .catch((err)=>res.status(500).send(err))
})

router.get('/:id',(req,res,next)=>{
  goalsDB.get(req.params.id)
  .then(goal=>res.send(goal))
  .catch((err)=>res.status(500).send(err))
})
router.put('/:id',json(), (req,res,next)=>{
  goalsDB.get(req.params.id)
  .catch((error)=> {
    if (error.name === 'not_found') {
      return { _rev:null}
    } else {
      throw error
    }
  })
  .then(({_rev,...other})=>goalsDB.put({...other,...req.body,_rev}))
  .then(goal=>res.send(goal))
  .catch((err)=>res.status(500).send(err))
})

router.post('/',json(), (req,res,next)=>{
  goalsDB.post(req.body)
  .then(goal=>res.send(goal))
  .catch((err)=>res.status(500).send(err))
})
