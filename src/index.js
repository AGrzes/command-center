const express = require('express')
const history = require('connect-history-api-fallback');
const path = require('path')
const app = express()

app.use('/api/goals', require('./goals'))
app.use(history())
app.use(express.static(path.join(__dirname, 'www')))
app.use(express.static(path.join(__dirname, 'generated')))


app.listen(3000, () => console.log('Command Center listening on port 3000!'))
