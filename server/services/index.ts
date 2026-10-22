import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'
import { dataAccess } from '../data'
import ExampleService from './exampleService'
import SendMoneyToPrisonerService from './sendMoneyToPrisonerService'
import logger from '../../logger'
import config from '../config'

export const services = () => {
  const { applicationInfo, exampleApiClient, prisonerMoniesApiClient } = dataAccess()

  const auditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)

  return {
    applicationInfo,
    auditService,
    exampleService: new ExampleService(exampleApiClient),
    sendMoneyToPrisonerService: new SendMoneyToPrisonerService(prisonerMoniesApiClient),
  }
}

export type Services = ReturnType<typeof services>
