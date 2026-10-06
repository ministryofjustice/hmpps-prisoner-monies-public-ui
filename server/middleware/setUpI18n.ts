import { Router } from 'express'
import middleware from 'i18next-http-middleware'
import i18next from '../i18n/i18n'

export default function setUpI18n(): Router {
  const router = Router()

  router.use(middleware.handle(i18next))

  router.use((req, res, next) => {
    res.locals.t = req.t
    res.locals.language = req.language
    next()
  })

  return router
}
