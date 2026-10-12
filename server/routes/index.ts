import { Router } from 'express'
import languageRouter from './language'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'
import startPageHandler from '../handlers/startPage'
import config from '../config'

export enum Page {
  SEARCH_OFFENDERS = 'SEARCH_OFFENDERS',
}

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/', (_req, res, _next) => {
    return res.redirect('/en-gb/')
  })
  // handle the start page route
  // move these to routes/index
  router.get('/start-page', startPageHandler(config))
  router.get('/info-page', (_req, res, _next) => {
    return res.render('pages/info-page')
  })

  router.use('/en-gb/', languageRouter(services))
  router.use('/cy/', languageRouter(services))

  return router
}
