import express from 'express'
import createError from 'http-errors'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
// import authorisationMiddleware from './middleware/authorisationMiddleware'

// import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
// import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpI18n from './middleware/setUpI18n'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setUpRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'
import type { Services } from './services'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  // app.use(setUpAuthentication())
  // app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  // app.use(setUpCurrentUser())
  const langRouter = setUpI18n()
  app.use(langRouter)

  app.use(routes(services, langRouter))

  app.use((_req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      res.status(404)
      res.render('pages/not-found')
      return
    }
    next(createError(404, 'Not found'))
  })
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
