import {Router} from 'express'
import * as _ from 'lodash'
import * as moment from 'moment'
import {exerciseGoalReport} from '../db'
export const router = Router()
type Activity = 'run' | 'pool' | 'crunches' | 'bike'
type Unit = 'session' | 'm' | 'km'
interface Goal {
  activity: Activity
  startDate: string
  dueDate: string
  target: number
  unit?: Unit
  archived: boolean
  meet?: boolean
}

interface ProgressItem {
  date: string
  increment: number
  total: number
}

interface GoalReport extends Goal {
  progress: ProgressItem[]
}

router.get('/', (req, res) => {
  exerciseGoalReport.allDocs<GoalReport>({include_docs: true}).then((response) => {
    res.send(_.map(response.rows, (report) => {
      const today = moment()
      const startDate = moment(report.doc.startDate)
      const dueDate = moment(report.doc.dueDate)
      const current = (_.last(report.doc.progress) || {total: 0}).total
      const target = report.doc.target
      const expected = (target / dueDate.diff(startDate, 'days')) * today.diff(startDate, 'days')
      const projected = (current / today.diff(startDate, 'days')) * dueDate.diff(startDate, 'days')
      return {
        ...report.doc,
        current,
        expected,
        projected
      }
    }))
  }).catch((error) => res.status(500).send(error))
})
