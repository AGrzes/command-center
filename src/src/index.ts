import * as history from 'connect-history-api-fallback'
import * as express from 'express'
import * as expressWs from 'express-ws'
import {router as config} from './api/config'
import {router as goals} from './goals'
import {router as progress} from './progress'
import {router as progressReport} from './progress/report'
import {router as reminders} from './reminders'
const app = express()
expressWs(app)
app.use('/api/goals', goals)
app.use('/api/reminders', reminders)
app.use('/api/progress-report', progressReport)
app.use('/api/progress', progress)
app.use('/api/config', config)
app.use(history())
app.use(express.static('www'))
app.use(express.static('web/generated'))
// tslint:disable-next-line:no-console
app.listen(3000, () => console.log('Command Center listening on port 3000!'))
