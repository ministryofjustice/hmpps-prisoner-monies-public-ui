import { Router, RequestHandler } from 'express'

import config from '../config'
import startPageHandler from '../handlers/startPage'
import { prisonerDetailsGetHandler, prisonerDetailsPostHandler } from '../handlers/prisonerDetails'
import i18next from '../i18n/i18n'
import { Services } from '../services'

export enum Page {
  SEARCH_OFFENDERS = 'SEARCH_OFFENDERS',
}

const DEFAULT_LANGUAGE_URL_SEGMENT = 'en-gb'

// Maps each old Django-style URL language prefix to an i18next language code.
const LANGUAGE_URL_PREFIXES: { urlSegment: string; language: 'en' | 'cy' }[] = [
  { urlSegment: DEFAULT_LANGUAGE_URL_SEGMENT, language: 'en' },
  { urlSegment: 'cy', language: 'cy' },
]

// Builds a middleware that fixes res.locals.t/language to one language, for mounting
// under a literal URL prefix (see routes() below).
function setLanguage(language: 'en' | 'cy'): RequestHandler {
  return (_req, res, next) => {
    res.locals.language = language
    res.locals.t = i18next.getFixedT(language)
    next()
  }
}

// Every localised page lives only under a language prefix (view name mirrors the path).
const LOCALISED_PAGE_PATHS = ['/terms']

function registerLocalisedPages(router: Router): void {
  LOCALISED_PAGE_PATHS.forEach(path => {
    router.get(path, (_req, res) => {
      res.render(`pages${path}`)
    })
  })
}

export default function routes(services: Services): Router {
  const router = Router()

  router.get(
    '/',
    startPageHandler({
      production: config.production,
      productionStartPageUrl: config.productionStartPageUrl,
      sendMoneyUrl: config.sendMoneyUrl,
    }),
  )

  router.get('/info-page', async (_req, res, _next) => {
    return res.render('pages/info-page')
  })

  router.get('/en-gb/', async (_req, res, _next) => {
    return res.render('pages/before-you-continue', { continueUrl: '/payment-choice', backLinkHref: '/' })
  })

  router.get('/payment-choice', async (_req, res, _next) => {
    return res.status(404).send('Not Found')
    // return res.render('pages/payment-choice', { backLinkHref: '/en-gb/' })
  })

  router.get('/debit-card/details', prisonerDetailsGetHandler)

  router.post('/debit-card/details', prisonerDetailsPostHandler(services.sendMoneyToPrisonerService))

  router.get('/debit-card/amount', async (_req, res, _next) => {
    return res.render('pages/payment-amount', {})
  })

  router.get('/contact-us', async (_req, res, _next) => {
    return res.render('pages/contact-us')
  })

  router.get('/privacy', async (_req, res, _next) => {
    return res.render('pages/privacy')
  })

  // A bare localised path redirects to its default-language (en-gb) version - there's no
  // unprefixed canonical URL for these pages.
  LOCALISED_PAGE_PATHS.forEach(path => {
    router.get(path, (_req, res) => {
      res.redirect(`/${DEFAULT_LANGUAGE_URL_SEGMENT}${path}`)
    })
  })

  LANGUAGE_URL_PREFIXES.forEach(({ urlSegment, language }) => {
    const languageRouter = Router()
    languageRouter.use(setLanguage(language))
    registerLocalisedPages(languageRouter)
    router.use(`/${urlSegment}`, languageRouter)
  })

  return router
}
