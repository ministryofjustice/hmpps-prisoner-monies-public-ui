import { Router } from 'express'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'

export enum Page {
  SEARCH_OFFENDERS = 'SEARCH_OFFENDERS',
}

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/', async (_req, res, _next) => {
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

  router.get('/debit-card/details', prisonerDetailsGetHandler)

  router.post('/debit-card/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get('/debit-card/amount', async (_req, res, _next) => {
    return res.render('pages/payment-amount', {})
  })

  router.get('/terms', async (_req, res, _next) => {
    return res.render('pages/terms')
  })

  router.get('/privacy', async (_req, res, _next) => {
    return res.render('pages/privacy')
  })

  router.get('/contact-us', async (_req, res, _next) => {
    return res.render('pages/contact-us')
  })

  return router
}
