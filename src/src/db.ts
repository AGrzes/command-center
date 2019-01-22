import * as debug from 'debug'
import {Ouch} from 'ouch-rx'
import * as PouchDB from 'pouchdb-http'
import * as PouchDBMapReduce from 'pouchdb-mapreduce'
import {of} from 'rxjs'
import { ProgressItem } from './model/progress'
import { Reminder } from './model/reminders'
import progressGoalReportQueries from './view/progress-goal-report'
import progressQueries from './view/progress-queries'
const log = debug('command-center:db')
PouchDB.plugin(PouchDBMapReduce)
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

export const goals = new PouchDB('http://couchdb:5984/goals')

export const reminders = new PouchDB<Reminder>('http://couchdb:5984/reminders')

export const progress = new PouchDB<ProgressItem>('http://couchdb:5984/progress')
const progressOuch = new Ouch(progress)
of (progressQueries).pipe(progressOuch.merge(updateVersion)).subscribe({
  complete() {
    log('views initialized')
  },
  error(e) {
    log('Error initializing views: %O', e)
  }})

export const progressGoalReport = new PouchDB<GoalReport>('http://couchdb:5984/progress-goal-report')
const progressGoalReportOuch = new Ouch(progressGoalReport)
of (progressGoalReportQueries).pipe(progressGoalReportOuch.merge(updateVersion)).subscribe({
  complete() {
    log('views initialized')
  },
  error(e) {
    log('Error initializing views: %O', e)
  }})
export const config = new PouchDB<any>('http://couchdb:5984/command-center-config')
