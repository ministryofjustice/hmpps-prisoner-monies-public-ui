import { Router } from 'express'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'
import { paymentAmountGetHandler, paymentAmountPostHandler } from '../handlers/paymentAmount'

// all pages that sit under /{locale}/debit-card/ in the application
export default function routes(services: Services): Router {
  const router = Router()

  router.get('/details', prisonerDetailsGetHandler)

  router.post('/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get('/amount', paymentAmountGetHandler)

  router.post('/amount', paymentAmountPostHandler())

  router.get('/check', (_req, res, _next) => {
    return res.render('pages/check-details', {})
  })
  return router
}
