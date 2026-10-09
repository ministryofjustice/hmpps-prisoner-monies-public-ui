import { Router } from 'express'

import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'

export enum Page {
  SEARCH_OFFENDERS = 'SEARCH_OFFENDERS',
}

export default function routes(services: Services, languageRouter: Router): Router {
  languageRouter.get('/', async (_req, res, _next) => {
    return res.render('pages/before-you-continue', {
      continueUrl: res.locals.localePath('/payment-choice'),
      backLinkHref: '/',
    })
  })

  languageRouter.get('/payment-choice', async (_req, res, _next) => {
    return res.render('pages/payment-choice', {
      backLinkHref: res.locals.localePath('/'),
      continueUrl: res.locals.localePath('/debit-card/details'),
    })
  })

  languageRouter.get('/debit-card/details', prisonerDetailsGetHandler)

  languageRouter.post('/debit-card/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  languageRouter.get('/debit-card/amount', async (_req, res, _next) => {
    return res.render('pages/payment-amount', {})
  })

  languageRouter.get('/terms', async (_req, res, _next) => {
    return res.render('pages/terms')
  })

  languageRouter.get('/privacy', async (_req, res, _next) => {
    return res.render('pages/privacy')
  })

  languageRouter.get('/contact-us', async (_req, res, _next) => {
    return res.render('pages/contact-us')
  })

  return languageRouter
}
