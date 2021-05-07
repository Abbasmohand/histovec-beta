import http from 'http'

import createApp from './app'
import { getAsync } from './connectors/redis'
import { connect } from './connectors/mongo'
import { techLogger } from './util'

import config from './config'
const { UTACClient } = require('./services/utac')

const PORT = config.port || 8000

techLogger.debug({ config: config })

connect().then(async () => {
  await getAsync('')
  let utacClient

  try {
    // /!\ boolean setting is passed as string /!\
    // @todo: we should use typed yaml to load settings
    const isApiActivated = config.utac.isApiActivated === true || config.utac.isApiActivated === 'true'
    if (isApiActivated) {
      utacClient = new UTACClient()
    }

    const app = createApp(utacClient)

    http.createServer(app).listen(PORT, '0.0.0.0')
    techLogger.info(`Server running at http://0.0.0.0:${PORT}/`)
    techLogger.debug(`Utac id key: ${config.utacIdKey}`)
  } catch (error) {
    techLogger.error(`Server could not connect to redis, exiting`)
    techLogger.error(error)
  }
}).catch(error => {
  techLogger.error(`Server could not connect to mongo, exiting`)
  techLogger.error(error)
})
