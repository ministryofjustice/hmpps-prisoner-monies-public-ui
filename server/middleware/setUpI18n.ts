import createError from 'http-errors'
import { Router } from 'express'
import middleware from 'i18next-http-middleware'
import i18next from '../i18n/i18n'
import config from '../config'
import startPageHandler from '../handlers/startPage'

const SUPPORTED_LANGUAGES: Record<string, 'en-gb' | 'cy'> = {
  'en-gb': 'en-gb',
  cy: 'cy',
}

export default function setUpI18n(): { router: Router; langRouter: Router } {
  const router = Router()

  router.use(middleware.handle(i18next))

  // root redirect to base language
  router.get('/', (_req, res, _next) => {
    res.redirect('/en-gb/')
  })

  // handle the start page route
  router.get('/start-page', startPageHandler(config))
  router.get('/info-page', (_req, res, _next) => {
    return res.render('pages/info-page')
  })

  const langRouter = Router({ mergeParams: true })
  router.use(
    '{/:lang}',
    (req, res, next) => {
      // check for language
      const langParam = req.params.lang ? req.params.lang : ''

      // is the first param of the path a legal language
      const language = typeof langParam === 'string' ? SUPPORTED_LANGUAGES[langParam] : ''

      // for debugging different languages
      // console.log('Language param:', langParam, 'Request path:', req.path, 'Language:', language)

      if (!language) {
        if (process.env.NODE_ENV === 'production') {
          res.status(404)
          res.render('pages/not-found')
          return
        }
        next(createError(404))
        return
      }

      // set the locale, and handle i18n translation
      res.locals.locale = language
      res.locals.t = i18next.getFixedT(language)
      res.locals.localePath = (path: string) => `/${language}${path.startsWith('/') ? path : `/${path}`}`

      next()
    },
    langRouter,
  )

  return { router, langRouter }
}
