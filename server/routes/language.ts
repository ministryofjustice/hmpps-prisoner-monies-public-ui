import { Router } from 'express'
import { Services } from '../services'
import debitCardRouter from './debit-card'
import auditPageViewRequest from '../middleware/auditPageViewRequest'
import paymentChoiceGetHandler from '../handlers/paymentChoice'
import Page from '../constants/pages'
import { paths } from '../constants/paths'

export default function routes(services: Services): Router {
  const router = Router()

  router.get(
    paths.BEFORE_YOU_CONTINUE,
    auditPageViewRequest({ services, page: Page.BEFORE_YOU_CONTINUE }),
    (_req, res, _next) => {
      // in production this will be set by env var
      const backLinkStartPage = paths.START

      return res.render('pages/before-you-continue', {
        continueUrl: res.locals.localePath(paths.PAYMENT_CHOICE),
        backLinkHref: backLinkStartPage,
      })
    },
  )

  router.get(
    paths.PAYMENT_CHOICE,
    auditPageViewRequest({ services, page: Page.PAYMENT_CHOICE }),
    paymentChoiceGetHandler(services.sendMoneyToPrisonerService),
  )

  router.get(paths.TERMS, auditPageViewRequest({ services, page: Page.TERMS }), (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/terms`)
  })

  router.get(paths.PRIVACY, auditPageViewRequest({ services, page: Page.PRIVACY }), (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/privacy`)
  })

  router.get(paths.COOKIES, auditPageViewRequest({ services, page: Page.COOKIES }), async (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/cookies`)
  })

  router.get(paths.ACCESSIBILITY, auditPageViewRequest({ services, page: Page.ACCESSIBILITY }), (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/accessibility`)
  })

  router.get(paths.HELP, auditPageViewRequest({ services, page: Page.HELP }), (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/help`)
  })

  router.get(paths.CONTACT_US, (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/contact-us`)
  })

  router.get(paths.HELP, auditPageViewRequest({ services, page: Page.HELP }), (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/help`)
  })

  router.use(debitCardRouter(services))

  return router
}
