import express from 'express'
import request from 'supertest'
import setUpI18n from './setUpI18n'
import { i18nextInitPromise } from '../i18n/i18n'

describe('setUpI18n', () => {
  beforeAll(() => i18nextInitPromise)

  function appWithI18n() {
    const app = express()
    const langRouter = setUpI18n()

    const viewsRouter = express.Router()
    viewsRouter.get('/', (_req, res) => {
      res.json({
        language: res.locals.language,
        translated: res.locals.t('terms.lawHeading'),
        fallback: res.locals.t('terms.pageTitle'),
      })
    })
    langRouter.use('{/:lang}', viewsRouter)

    app.use(langRouter)
    return app
  }

  it('redirects the bare root path to the default language', () => {
    return request(appWithI18n()).get('/').expect(302).expect('Location', '/en-gb/')
  })

  it('sets the language and translator for a supported language prefix', () => {
    return request(appWithI18n())
      .get('/en-gb/')
      .expect(200)
      .expect(res => {
        expect(res.body.language).toBe('en')
        expect(res.body.translated).toBe('Applicable law')
      })
  })

  it('translates into Welsh for the /cy prefix', () => {
    return request(appWithI18n())
      .get('/cy/')
      .expect(200)
      .expect(res => {
        expect(res.body.language).toBe('cy')
        expect(res.body.translated).toBe('Y gyfraith sy’n berthnasol')
      })
  })

  it('falls back to the default language when a translation key is missing', () => {
    return request(appWithI18n())
      .get('/cy/')
      .expect(200)
      .expect(res => {
        // 'terms.pageTitle' only exists in the en translation file
        expect(res.body.fallback).toBe('Terms and conditions')
      })
  })

  it('404s for an unsupported language prefix', () => {
    return request(appWithI18n()).get('/fr/').expect(404)
  })
})
