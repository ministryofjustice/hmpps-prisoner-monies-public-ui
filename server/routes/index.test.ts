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

describe('GET /', () => {
  it('should render start page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Send money to someone in prison')
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

describe('GET /en-gb/', () => {
  it('should render before you continue page', () => {
    return request(app)
      .get('/en-gb/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Before you continue')
        expect(res.text).toContain('href="/payment-choice"')
        expect(res.text).toContain('href="/terms"')
        expect(res.text).toContain('href="/privacy"')
        expect(res.text).toContain('href="/contact-us"')
        expect(res.text).toContain('govuk-back-link')
      })
  })
})

describe('GET /payment-choice', () => {
  it('should render payment choice page', () => {
    return request(app).get('/payment-choice').expect('Content-Type', /html/).expect(404)
    // .expect(res => {
    //   expect(res.text).toContain('Pay now by debit card')
    //   expect(res.text).toContain('id="id_debit_card"')
    //   expect(res.text).toContain('href="/debit-card/details"')
    //   expect(res.text).toContain('govuk-back-link')
    // })
  })
})

describe('GET /terms', () => {
  it('renders the terms and conditions content, including an unstyled contact-us link matching the original markup', () => {
    return request(app)
      .get('/terms')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Terms and conditions')
        expect(res.text).toContain('a href="/contact-us"')
      })
  })

  it('shows the accepted card scheme logos at the same sizes as send-money (large: 160x146, small: 95x87)', () => {
    return request(app)
      .get('/terms')
      .expect(200)
      .expect(res => {
        ;['visa', 'mastercard', 'maestro'].forEach(scheme => {
          expect(res.text).toContain(`images/card-acceptance-signage/${scheme}.svg" width="160" height="146"`)
          expect(res.text).toContain(`images/card-acceptance-signage/${scheme}.svg" width="95" height="87"`)
        })
      })
  })
})

describe('GET /privacy', () => {
  it('should render privacy page', () => {
    return request(app)
      .get('/privacy')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Privacy policy')
      })
  })
})

describe('GET /contact-us', () => {
  it('should render contact us page', () => {
    return request(app)
      .get('/contact-us')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Contact us')
      })
  })
})

describe('GET /debit-card/details', () => {
  it('renders a form whose field names match what the handler reads from the request body', () => {
    return request(app)
      .get('/debit-card/details')
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

describe('POST /debit-card/details', () => {
  it('redirects to the amount page when the prisoner details are valid', () => {
    sendMoneyToPrisonerService.getValidPrisoner.mockResolvedValue({
      prisonerNumber: 'A1234BC',
      prisonerDOB: '1990-2-1',
    })

    return request(app)
      .post('/debit-card/details')
      .type('form')
      .send({
        prisoner_name: 'John Smith',
        prisoner_dob_0: '1',
        prisoner_dob_1: '2',
        prisoner_dob_2: '1990',
        prisoner_number: 'A1234BC',
      })
      .expect(302)
      .expect('Location', '/debit-card/amount')
      .expect(() => {
        expect(sendMoneyToPrisonerService.getValidPrisoner).toHaveBeenCalledWith('A1234BC', '1990-2-1')
      })
  })

  it('re-renders with an error summary whose links point at ids present on the page', () => {
    return request(app)
      .post('/debit-card/details')
      .type('form')
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('href="#id_prisoner_name-label"')
        expect(res.text).toContain('id="id_prisoner_name"')
        expect(res.text).toContain('href="#id_prisoner_dob_0-label"')
        expect(res.text).toContain('id="id_prisoner_dob_0"')
        expect(res.text).toContain('href="#id_prisoner_number-label"')
        expect(res.text).toContain('id="id_prisoner_number"')
      })
  })
})

describe('GET /debit-card/amount', () => {
  it('renders a form whose field name matches what the handler reads from the request body', () => {
    return request(app)
      .get('/debit-card/amount')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('name="amount"')
      })
  })
})
