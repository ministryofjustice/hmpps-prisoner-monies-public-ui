import { Router } from 'express'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'
import { paymentAmountGetHandler, paymentAmountPostHandler } from '../handlers/paymentAmount'
import checkDetailsGetHandler from '../handlers/checkDetails'

// all pages that sit under /{locale}/debit-card/ in the application
export default function routes(services: Services): Router {
  const router = Router()

  router.get('/details', prisonerDetailsGetHandler)

  router.post('/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get('/amount', paymentAmountGetHandler)

  router.post('/amount', paymentAmountPostHandler())

  router.get('/check', checkDetailsGetHandler)
  return router
}
