import { Router } from 'express'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'

// all pages that sit under /{locale}/debit-card/ in the application
export default function routes(services: Services): Router {
  const router = Router()

  router.get('/details', prisonerDetailsGetHandler)

  router.post('/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get('/amount', async (_req, res, _next) => {
    return res.render('pages/payment-amount', {})
  })

  return router
}
