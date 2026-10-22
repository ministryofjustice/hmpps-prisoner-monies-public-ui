import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'

export interface ServiceAvailabilityResponse {
  gov_uk_pay?: {
    status?: boolean
    message_to_users?: string
  }
}

export default class PrisonerMoniesApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prisoner Monies API', config.apis.prisonerMoniesApi, logger, authenticationClient)
  }

  getServiceAvailability() {
    return this.get<ServiceAvailabilityResponse>({ path: '/service-availability/' }, asSystem())
  }
}
