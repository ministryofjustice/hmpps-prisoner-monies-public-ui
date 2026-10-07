import createError from 'http-errors'
import { Router } from 'express'
import middleware from 'i18next-http-middleware'
import i18next from '../i18n/i18n'
import config from '../config'
import startPageHandler from '../handlers/startPage'

const SUPPORTED_LANGUAGES: Record<string, 'en' | 'cy'> = {
  'en-gb': 'en',
  cy: 'cy',
}

export default function setUpI18n(): Router {
  const router = Router()

  router.use(middleware.handle(i18next))

  // root redirect to base language
  router.get('/', (_req, res, _next) => {
    res.redirect('/en-gb/')
  })

  // handle the info page route
  router.get(
    '/info-page',
    startPageHandler({
      production: config.production,
      productionStartPageUrl: config.productionStartPageUrl,
      sendMoneyUrl: config.sendMoneyUrl,
    }),
  )

  router.get('/not-found', (_req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      res.status(404)
      res.render('pages/not-found')
      return
    }
    next(createError(404))
  })

  router.use('{/:lang}', (req, res, next) => {
    // check for language
    const langParam = req.params.lang ? req.params.lang : ''

    // is the first param of the path a legal language
    const language = typeof langParam === 'string' ? SUPPORTED_LANGUAGES[langParam] : ''

    // for debugging different languages
    console.log('Language param:', langParam, 'Request path:', req.path, 'Language:', language)

    if (!language) {
      if (process.env.NODE_ENV === 'production') {
        res.status(404)
        res.render('pages/not-found')
        return
      }
      next(createError(404))
      return
    }

    // set the language, and handle i18n translation
    res.locals.language = language
    res.locals.t = i18next.getFixedT(language)
    res.locals.urlLang = langParam

    next()
  })

  return router
}
