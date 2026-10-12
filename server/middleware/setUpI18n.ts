import { Router } from 'express'
import middleware from 'i18next-http-middleware'
import i18next from '../i18n/i18n'
import { buildLocalePath } from '../utils/locale'

export default function setUpI18n(): Router {
  const router = Router({ mergeParams: true })

  router.use(middleware.handle(i18next))

  router.use('/:lang', (req, res, next) => {
    // check for language
    const { lang } = req.params

    // for debugging different languages
    // console.log('Language param:', langParam, 'Request path:', req.path, 'Language:', language)

    // set the locale, and handle i18n translation
    res.locals.locale = lang || ''
    res.locals.t = i18next.getFixedT(res.locals.locale)
    res.locals.localePath = buildLocalePath(res.locals.locale)

    next()
  })

  return router
}
