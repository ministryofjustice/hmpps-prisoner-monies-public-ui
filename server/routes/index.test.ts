import type { Express } from 'express'
import { AuditService } from '@ministryofjustice/hmpps-audit-client'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import ExampleService from '../services/exampleService'
import ExampleApiClient from '../data/exampleApiClient'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'

jest.mock('@ministryofjustice/hmpps-audit-client')
jest.mock('../services/exampleService')
jest.mock('../services/sendMoneyToPrisonerService')

const auditService = new AuditService({} as never) as jest.Mocked<AuditService>
const exampleService = new ExampleService({} as ExampleApiClient) as jest.Mocked<ExampleService>
const sendMoneyToPrisonerService = new SendMoneyToPrisonerService() as jest.Mocked<SendMoneyToPrisonerService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      exampleService,
      sendMoneyToPrisonerService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /start-page', () => {
  it('should render start-page page', () => {
    return request(app)
      .get('/start-page')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Send money to someone in prison')
        expect(res.text).toContain('Staying in touch with someone in prison')
        expect(res.text).toContain('Start now')
      })
  })
})

describe('GET /info-page', () => {
  it('should render info page', () => {
    return request(app)
      .get('/info-page')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Staying in touch with someone in prison')
      })
  })
})
describe('GET /payment-choice', () => {
  it('should render payment choice page', () => {
    return request(app).get('/payment-choice').expect('Content-Type', /html/).expect(404)
  })
})

describe('GET /:lang/terms with an unsupported prefix', () => {
  it('should 404', () => {
    return request(app).get('/fr/terms').expect(404)
  })
})

describe.each([
  ['en-gb', 'Before you continue'],
  ['cy', 'Before you continue'],
])('GET /%s/', (locale, expectedHeading) => {
  it('should render before you continue page', () => {
    return request(app)
      .get(`/${locale}/`)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(expectedHeading)
        expect(res.text).toContain(`href="/${locale}/payment-choice"`)
        expect(res.text).toContain(`href="/${locale}/terms"`)
        expect(res.text).toContain(`href="/${locale}/privacy"`)
        expect(res.text).toContain(`href="/${locale}/contact-us"`)
        expect(res.text).toContain('govuk-back-link')
      })
  })
})

describe.each([
  ['en-gb', 'Contact us'],
  ['cy', 'Contact us'],
])('GET /%s/contact-us', (locale, expectedHeading) => {
  it('should render contact us page', () => {
    return request(app)
      .get(`/${locale}/contact-us`)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => expect(res.text).toContain(expectedHeading))
  })
})

describe.each([
  ['en-gb', 'Privacy policy'],
  ['cy', 'Privacy policy'],
])('GET /%s/privacy', (locale, expectedHeading) => {
  it('should render privacy page', () => {
    return request(app)
      .get(`/${locale}/privacy`)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => expect(res.text).toContain(expectedHeading))
  })
})

describe.each([
  ['en-gb', 'Terms and conditions'],
  ['cy', 'Y gyfraith sy’n berthnasol'],
])('GET /%s/terms', (locale, expectedHeading) => {
  it('renders the translated terms page', () => {
    return request(app)
      .get(`/${locale}/terms`)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => expect(res.text).toContain(expectedHeading))
  })
})

describe.each([['en-gb'], ['cy']])('GET /%s/debit-card/details', locale => {
  it('renders a form whose field names match what the handler reads from the request body', () => {
    return request(app)
      .get(`/${locale}/debit-card/details`)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('name="prisoner_name"')
        expect(res.text).toContain('name="prisoner_dob_0"')
        expect(res.text).toContain('name="prisoner_dob_1"')
        expect(res.text).toContain('name="prisoner_dob_2"')
        expect(res.text).toContain('name="prisoner_number"')
      })
  })
})

describe.each([['en-gb'], ['cy']])('POST /%s/debit-card/details', locale => {
  it('redirects to the amount page when the prisoner details are valid', () => {
    sendMoneyToPrisonerService.getValidPrisoner.mockResolvedValue({
      prisonerNumber: 'A1234BC',
      prisonerDOB: '1990-2-1',
    })

    return request(app)
      .post(`/${locale}/debit-card/details`)
      .type('form')
      .send({
        prisoner_name: 'John Smith',
        prisoner_dob_0: '1',
        prisoner_dob_1: '2',
        prisoner_dob_2: '1990',
        prisoner_number: 'A1234BC',
      })
      .expect(302)
      .expect('Location', `/${locale}/debit-card/amount`)
      .expect(() => {
        expect(sendMoneyToPrisonerService.getValidPrisoner).toHaveBeenCalledWith('A1234BC', '1990-2-1')
      })
  })

  it('re-renders with an error summary whose links point at ids present on the page', () => {
    return request(app)
      .post(`/${locale}/debit-card/details`)
      .type('form')
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('href="#id_prisoner_name"')
        expect(res.text).toContain('id="id_prisoner_name"')
        expect(res.text).toContain('href="#id_prisoner_dob_0"')
        expect(res.text).toContain('id="id_prisoner_dob_0"')
        expect(res.text).toContain('href="#id_prisoner_number"')
        expect(res.text).toContain('id="id_prisoner_number"')
      })
  })
})

describe.each([['en-gb'], ['cy']])('GET /%s/debit-card/amount', locale => {
  it('renders a form whose field name matches what the handler reads from the request body', () => {
    return request(app)
      .get(`/${locale}/debit-card/amount`)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('name="amount"')
      })
  })
})

describe.each([['en-gb'], ['cy']])('POST /%s/debit-card/amount', locale => {
  it('redirects to the check details page when the amount is valid', () => {
    return request(app)
      .post(`/${locale}/debit-card/amount`)
      .type('form')
      .send({ amount: '17.50' })
      .expect(302)
      .expect('Location', `/${locale}/debit-card/check`)
  })

  it('re-renders with an error summary whose link points at the amount field', () => {
    return request(app)
      .post(`/${locale}/debit-card/amount`)
      .type('form')
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('href="#id_amount"')
        expect(res.text).toContain('id="id_amount"')
      })
  })
})

describe('language route test', () => {
  it('redirects the bare root path to the default language', () => {
    return request(app).get('/').expect(302).expect('Location', '/en-gb/')
  })

  it('sets the language and translator for a supported language prefix', () => {
    return request(app)
      .get('/en-gb/terms')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('<html lang="en-gb" ')
        expect(res.text).toContain('Applicable law')
      })
  })

  it('translates into Welsh for the /cy prefix', () => {
    return request(app)
      .get('/cy/terms')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('<html lang="cy" ')
        expect(res.text).toContain('Y gyfraith sy’n berthnasol')
      })
  })

  it('falls back to the default language when a translation key is missing', () => {
    return request(app)
      .get('/cy/')
      .expect(200)
      .expect(res => {
        // 'terms.pageTitle' only exists in the en translation
        expect(res.text).toContain('<a class="govuk-link" href="/cy/terms">terms and conditions</a>')
      })
  })

  it('404s for an unsupported language prefix', () => {
    return request(app).get('/fr/').expect(404)
  })
})
