import { Router } from 'express'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import { Services } from '../services'
import { paymentAmountGetHandler, paymentAmountPostHandler } from '../handlers/paymentAmount'
import auditPageViewRequest from '../middleware/auditPageViewRequest'
import Page from '../constants/pages'
import auditPageEventRequest from '../middleware/auditPageEventRequest'
import AuditEvent from '../constants/events'
import { debitCardPaths } from '../constants/paths'
import checkDetailsGetHandler from '../handlers/checkDetails'

export default function routes(services: Services): Router {
  const router = Router()

  router.get(
    debitCardPaths.PRISONER_DETAILS,
    auditPageViewRequest({ services, page: Page.DEBIT_CARD_DETAILS }),
    prisonerDetailsGetHandler,
  )

  router.post(debitCardPaths.PRISONER_DETAILS, prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get(
    debitCardPaths.PAYMENT_AMOUNT,
    auditPageViewRequest({ services, page: Page.DEBIT_CARD_AMOUNT }),
    paymentAmountGetHandler,
  )

  router.post(
    debitCardPaths.PAYMENT_AMOUNT,
    auditPageEventRequest({
      services,
      whatEvent: AuditEvent.AMOUNT_TO_VALIDATE,
      getEventDetails: req => ({ amount: req.body.amount }),
    }),
    paymentAmountPostHandler(),
  )

  router.get(debitCardPaths.CHECK_DETAILS, checkDetailsGetHandler)

  return router
}
