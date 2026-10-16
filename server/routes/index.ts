import { Router } from 'express'
import { Services } from '../services'
import languageRouter from './language'
import startPageHandler from '../handlers/startPage'
import config from '../config'
import auditPageViewRequest from '../middleware/auditPageViewRequest'
import Page from '../constants/pages'

export default function routes(services: Services): Router {
  const router = Router()

  // redirect blank to the English start page
  router.get('/', auditPageViewRequest({ services, page: Page.BEFORE_YOU_CONTINUE }), (_req, res, _next) => {
    return res.redirect('/en-gb/')
  })

  // handle the place holder pages
  router.get('/start-page', auditPageViewRequest({ services, page: Page.START }), startPageHandler(config))
  router.get('/info-page', auditPageViewRequest({ services, page: Page.STAY_IN_TOUCH }), (_req, res, _next) => {
    return res.render('pages/info-page')
  })

  // configure the langauge specific routing
  router.use('/en-gb/', languageRouter(services))
  router.use('/cy/', languageRouter(services))

  return router
}
