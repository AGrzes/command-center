import * as PouchDB from 'pouchdb-http'
import { ProgressItem } from './model/progress'
import { Reminder } from './model/reminders'

export const goals = new PouchDB('http://couchdb:5984/goals')

export const reminders = new PouchDB<Reminder>('http://couchdb:5984/reminders')

export const progress = new PouchDB<ProgressItem>('http://couchdb:5984/progress')
