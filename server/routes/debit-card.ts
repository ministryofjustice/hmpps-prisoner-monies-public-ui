import { Router } from 'express'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'
import { paymentAmountGetHandler, paymentAmountPostHandler } from '../handlers/paymentAmount'
import auditPageViewRequest from '../middleware/auditPageViewRequest'
import Page from '../constants/pages'
import auditPageEventRequest from '../middleware/auditPageEventRequest'
import AuditEvent from '../constants/events'
import paths from '../constants/paths'

// all pages that sit under /{locale}/debit-card/ in the application
export default function routes(services: Services): Router {
  const router = Router()

  router.get(paths.DEBIT_CARD.DETAILS, prisonerDetailsGetHandler)

  router.post(paths.DEBIT_CARD.DETAILS, prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get(
    paths.DEBIT_CARD.AMOUNT,
    auditPageViewRequest({ services, page: Page.DEBIT_CARD_AMOUNT }),
    paymentAmountGetHandler,
  )

  router.post(
    paths.DEBIT_CARD.AMOUNT,
    auditPageEventRequest({
      services,
      whatEvent: AuditEvent.AMOUNT_TO_VALIDATE,
      getEventDetails: req => ({ amount: req.body.amount }),
    }),
    paymentAmountPostHandler(),
  )

  router.get(paths.DEBIT_CARD.CHECK, (_req, res, _next) => {
    return res.render('pages/check-details', {})
  })
  return router
}
