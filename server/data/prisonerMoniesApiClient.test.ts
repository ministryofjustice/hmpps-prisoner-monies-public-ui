import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import PrisonerMoniesApiClient from './prisonerMoniesApiClient'
import config from '../config'

describe('PrisonerMoniesApiClient', () => {
  let prisonerMoniesApiClient: PrisonerMoniesApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    prisonerMoniesApiClient = new PrisonerMoniesApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getServiceAvailability', () => {
    it('should make a GET request to /service-availability/ using a system token and return the response body', async () => {
      nock(config.apis.prisonerMoniesApi.url)
        .get('/service-availability/')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { gov_uk_pay: { status: false, message_to_users: 'Down for maintenance' } })

      const response = await prisonerMoniesApiClient.getServiceAvailability()

      expect(response).toEqual({ gov_uk_pay: { status: false, message_to_users: 'Down for maintenance' } })
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })
})
