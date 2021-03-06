import * as debug from 'debug'
import {Ouch} from 'ouch-rx'
import * as PouchDBAdapterHttp from 'pouchdb-adapter-http'
import * as PouchDB from 'pouchdb-core'
import * as PouchDBMapReduce from 'pouchdb-mapreduce'
import {of} from 'rxjs'
import { ProgressItem } from './model/progress'
import { Reminder } from './model/reminders'
import progressGoalReportQueries from './view/progress-goal-report'
import progressQueries from './view/progress-queries'
const log = debug('command-center:db')
PouchDB.plugin(PouchDBAdapterHttp).plugin(PouchDBMapReduce)
function updateVersion<T extends object>(newDoc: T & {version: string},
                                         oldDoc?: T & {version: string} & {_rev: string}): any {
  if (oldDoc) {
    if (oldDoc.version === newDoc.version) {
      return null
    } else {
      return {...newDoc, _rev: oldDoc._rev}
    }
  } else {
    return newDoc
  }
}

const serverURI = process.env.COUCH_SERVER_URI || 'http://couchdb:5984'

export const goals = new PouchDB(`${serverURI}/goals`)

export const reminders = new PouchDB<Reminder>(`${serverURI}/reminders`)

export const progress = new PouchDB<ProgressItem>(`${serverURI}/progress`)
const progressOuch = new Ouch(progress)
of (progressQueries).pipe(progressOuch.merge(updateVersion)).subscribe({
  complete() {
    log('views initialized')
  },
  error(e) {
    log('Error initializing views: %O', e)
  }})

export const progressGoalReport = new PouchDB<GoalReport>(`${serverURI}/progress-goal-report`)
const progressGoalReportOuch = new Ouch(progressGoalReport)
of (progressGoalReportQueries).pipe(progressGoalReportOuch.merge(updateVersion)).subscribe({
  complete() {
    log('views initialized')
  },
  error(e) {
    log('Error initializing views: %O', e)
  }})
export const config = new PouchDB<any>(`${serverURI}/command-center-config`)
