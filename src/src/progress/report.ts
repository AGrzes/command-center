import {Router} from 'express'
import addWsMethod from 'express-ws/lib/add-ws-method'
import * as _ from 'lodash'
import * as moment from 'moment'
import {progressGoalReport} from '../db'
export const router = Router()
addWsMethod(router)

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

router.ws('/updates', (ws, req) => {
  const changes = progressGoalReport.changes({since: 'now', live: true})
    .on('change', (change) => ws.send(JSON.stringify(change)))
    .on('complete', () => ws.close(1000))
    .on('error', (error) => ws.close(1011, JSON.stringify(error)))
  ws.on('close', () => changes.cancel())
  ws.on('error', () => changes.cancel())
})

router.get('/', (req, res) => {
  progressGoalReport.allDocs<GoalReport>({include_docs: true}).then((response) => {
    res.send(_.map(response.rows, (report) => {
      const startDate = moment(report.doc.startDate)
      const dueDate = moment(report.doc.dueDate)
      const today = moment.min(moment(), dueDate)
      const current = (_.last(report.doc.progress) || {total: 0}).total
      const target = report.doc.target
      const expected = (target / dueDate.diff(startDate, 'days')) * today.diff(startDate, 'days')
      const projected = (current / today.diff(startDate, 'days')) * dueDate.diff(startDate, 'days')
      const progress = report.doc.progress
      if (progress && progress[0] && !startDate.isSame(progress[0].date, 'day')) {
        progress.unshift({
          date: startDate.format('YYYY-MM-DD'),
          increment: 0,
          total: 0
        })
      }
      if (progress && progress[progress.length - 1] && !today.isSame(progress[progress.length - 1].date, 'day')) {
        progress.push({
          date: today.format('YYYY-MM-DD'),
          increment: 0,
          total: current
        })
      }
      return {
        ...report.doc,
        current,
        expected,
        projected
      }
    }))
  }).catch((error) => res.status(500).send(error))
})
