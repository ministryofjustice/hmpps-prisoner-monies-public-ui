import { Router } from 'express'
import { Services } from '../services'
import debitCardRouter from './debit-card'
import auditPageViewRequest from '../middleware/auditPageViewRequest'
import Page from '../constants/pages'

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/', auditPageViewRequest({ services, page: Page.BEFORE_YOU_CONTINUE }), (_req, res, _next) => {
    // in production this will be set by env var
    const backLinkStartPage = '/start-page'

    return res.render('pages/before-you-continue', {
      continueUrl: res.locals.localePath('/payment-choice'),
      backLinkHref: backLinkStartPage,
    })
  })

  router.get('/payment-choice', async (_req, res, _next) => {
    return res.render('pages/payment-choice', {
      backLinkHref: res.locals.localePath('/'),
      continueUrl: res.locals.localePath('/debit-card/details'),
    })
  })

  router.get('/terms', async (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/terms`)
  })

  router.get('/privacy', async (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/privacy`)
  })

  router.get('/contact-us', async (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/contact-us`)
  })

  router.use('/debit-card', debitCardRouter(services))

  return router
}
