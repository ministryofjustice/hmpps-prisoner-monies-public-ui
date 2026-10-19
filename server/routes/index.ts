import { Router } from 'express'
import { Services } from '../services'
import languageRouter from './language'
import startPageHandler from '../handlers/startPage'
import config from '../config'
import auditPageViewRequest from '../middleware/auditPageViewRequest'
import Page from '../constants/pages'
import { paths } from '../constants/paths'

export default function routes(services: Services): Router {
  const router = Router()

  // redirect blank to the English start page
  router.get(paths.ROOT, (_req, res, _next) => {
    return res.redirect(paths.LOCALE_EN_GB)
  })

  // handle the place holder pages
  router.get(paths.START, auditPageViewRequest({ services, page: Page.START }), startPageHandler(config))
  router.get(paths.STAY_IN_TOUCH, auditPageViewRequest({ services, page: Page.STAY_IN_TOUCH }), (_req, res, _next) => {
    return res.render('pages/info-page')
  })

  // configure the langauge specific routing
  router.use(paths.LOCALE_EN_GB, languageRouter(services))
  router.use(paths.LOCALE_CY, languageRouter(services))

  return router
}
