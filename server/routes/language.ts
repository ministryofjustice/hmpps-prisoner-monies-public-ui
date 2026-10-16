import { Router } from 'express'
import { Services } from '../services'
import debitCardRouter from './debit-card'
import auditPageViewRequest from '../middleware/auditPageViewRequest'
import Page from '../constants/pages'
import paths from '../constants/paths'

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

  router.get(paths.PAYMENT_CHOICE, (_req, res, _next) => {
    return res.render('pages/payment-choice', {
      backLinkHref: res.locals.localePath(paths.ROOT),
      continueUrl: res.locals.localePath(`${paths.DEBIT_CARD.ROOT}${paths.DEBIT_CARD.DETAILS}`),
    })
  })

  router.get(paths.TERMS, (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/terms`)
  })

  router.get(paths.PRIVACY, (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/privacy`)
  })

  router.get(paths.CONTACT_US, (_req, res, _next) => {
    return res.render(`pages/${res.locals.locale}/contact-us`)
  })

  router.use(paths.DEBIT_CARD.ROOT, debitCardRouter(services))

  return router
}
