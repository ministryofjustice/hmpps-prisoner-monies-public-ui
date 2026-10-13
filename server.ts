import './server/utils/azureAppInsights'

import app from './server/index'
import logger from './logger'
import { i18nextInitPromise } from './server/i18n/i18n'

i18nextInitPromise.then(() => {
  app.listen(app.get('port'), () => {
    logger.info(`Server listening on port ${app.get('port')}`)
  })
})
