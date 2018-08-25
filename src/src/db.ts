import * as PouchDB from 'pouchdb-http'

export const goals = new PouchDB('http://couchdb:5984/goals')

export const reminders = new PouchDB('http://couchdb:5984/reminders')
