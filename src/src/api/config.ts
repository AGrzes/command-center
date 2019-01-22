
import {Router} from 'express'
import {config} from '../service/config'

export const router = Router()

router.get('/:configId', (req, res) => {
  config(req.params.configId)
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send(err))
})
