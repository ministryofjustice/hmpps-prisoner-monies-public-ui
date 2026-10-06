import request from 'supertest'
import express from 'express'
import setUpI18n from './setUpI18n'
import { i18nextInitPromise } from '../i18n/i18n'

describe('setUpI18n', () => {
  beforeAll(() => i18nextInitPromise)

  function appWithI18n() {
    const app = express()
    app.use(setUpI18n())
    app.get('/', (_req, res) => {
      res.json({
        language: res.locals.language,
        supportedLanguages: res.locals.supportedLanguages,
        translated: res.locals.t('terms.lawHeading'),
        fallback: res.locals.t('terms.pageTitle'),
      })
    })
    return app
  }

  it('defaults to English', async () => {
    const response = await request(appWithI18n()).get('/')

    expect(response.body).toEqual({
      language: 'en',
      supportedLanguages: ['en', 'cy'],
      translated: 'Applicable law',
      fallback: 'Terms and conditions',
    })
  })

  it('uses the language requested via the lng cookie', async () => {
    const response = await request(appWithI18n()).get('/').set('Cookie', 'lng=cy')

    expect(response.body).toMatchObject({
      language: 'cy',
      translated: 'Y gyfraith sy’n berthnasol',
      // falls back to English since terms.pageTitle has no Welsh translation
      fallback: 'Terms and conditions',
    })
  })

  it('falls back to English for an unsupported language', async () => {
    const response = await request(appWithI18n()).get('/').set('Cookie', 'lng=fr')

    expect(response.body).toMatchObject({
      translated: 'Applicable law',
    })
  })
})
