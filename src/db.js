const PouchDB = require('pouchdb-http')


const goals = new PouchDB('http://couchdb:5984/goals')

module.exports.goals = goals
const reminders = new PouchDB('http://couchdb:5984/reminders')

module.exports.reminders = reminders
