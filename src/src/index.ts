import * as history from 'connect-history-api-fallback'
import * as express from 'express'
import {router as goals} from './goals'
import {router as reminders} from './reminders'
const app = express()

app.use('/api/goals', goals)
app.use('/api/reminders', reminders)
app.use(history())
app.use(express.static('www'))
app.use(express.static('web/generated'))
// tslint:disable-next-line:no-console
app.listen(3000, () => console.log('Command Center listening on port 3000!'))
