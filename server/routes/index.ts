import { Router } from 'express'
import config from '../config'
import startPageHandler from '../handlers/startPage'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { paymentAmountGetHandler, paymentAmountPostHandler } from '../handlers/paymentAmount'
import languageRouter from './language'
import { Services } from '../services'

export enum Page {
  SEARCH_OFFENDERS = 'SEARCH_OFFENDERS',
}

export default function routes(services: Services): Router {
  const router = Router()

  // redirect blank to the English start page
  router.get('/', (_req, res, _next) => {
    return res.redirect('/en-gb/')
  })

  // handle the place holder pages
  router.get('/start-page', startPageHandler(config))
  router.get('/info-page', (_req, res, _next) => {
    return res.render('pages/info-page')
  })

  router.get('/payment-choice', async (_req, res, _next) => {
    return res.status(404).send('Not Found')
    // return res.render('pages/payment-choice', { backLinkHref: '/en-gb/' })
  })

  router.get('/debit-card/details', prisonerDetailsGetHandler)

  router.post('/debit-card/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get('/debit-card/amount', paymentAmountGetHandler)

  router.post('/debit-card/amount', paymentAmountPostHandler())

  router.get('/debit-card/check', async (_req, res, _next) => {
    return res.render('pages/check-details', {})
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
  // configure the langauge specific routing
  router.use('/en-gb/', languageRouter(services))
  router.use('/cy/', languageRouter(services))

  return router
}
