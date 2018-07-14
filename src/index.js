const express = require('express')
const path = require('path')
const app = express()

app.use('/goals', require('./goals'))
app.use(express.static(path.join(__dirname, 'www')))
app.use(express.static(path.join(__dirname, 'generated')))

app.listen(3000, () => console.log('Command Center listening on port 3000!'))
