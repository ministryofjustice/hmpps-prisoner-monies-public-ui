import { Router } from 'express'

import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'

export enum Page {
  SEARCH_OFFENDERS = 'SEARCH_OFFENDERS',
}

export default function routes(services: Services, languageRouter: Router): Router {
  const viewsRouter = Router()

  viewsRouter.get('/', async (_req, res, _next) => {
    return res.render('pages/before-you-continue', {
      continueUrl: `/${res.locals.urlLang}/payment-choice`,
      backLinkHref: '/',
    })
  })

  viewsRouter.get('/payment-choice', async (_req, res, _next) => {
    return res.status(404).send('Not Found')
    // return res.render('pages/payment-choice', { backLinkHref: `/${res.locals.language}/` })
  })

  viewsRouter.get('/debit-card/details', prisonerDetailsGetHandler)

  viewsRouter.post('/debit-card/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  viewsRouter.get('/debit-card/amount', async (_req, res, _next) => {
    return res.render('pages/payment-amount', {})
  })

  viewsRouter.get('/terms', (_req, res, _next) => {
    res.render('pages/terms')
  })
  viewsRouter.get('/terms', async (_req, res, _next) => {
    return res.render('pages/terms')
  })

  viewsRouter.get('/privacy', async (_req, res, _next) => {
    return res.render('pages/privacy')
  })

  viewsRouter.get('/contact-us', async (_req, res, _next) => {
    return res.render('pages/contact-us')
  })

  // add the viewsRouter to the language group router
  languageRouter.use('{/:lang}', viewsRouter)

  return languageRouter
}
