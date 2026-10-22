import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest => stubPing('/prisoner-monies-api', httpStatus),

  stubServiceAvailable: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/prisoner-monies-api/service-availability/',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { gov_uk_pay: { status: true } },
      },
    }),

  stubServiceUnavailable: (messageToUsers: string): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/prisoner-monies-api/service-availability/',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { gov_uk_pay: { status: false, message_to_users: messageToUsers } },
      },
    }),
}
