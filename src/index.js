const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Command Center!'))

app.listen(3000, () => console.log('Command Center listening on port 3000!'))
