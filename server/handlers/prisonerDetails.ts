import type { RequestHandler } from 'express'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'
import { validatePrisonerDetails, PrisonerDetailsFormValues } from '../utils/prisonerDetailsValidation'

export const PRISONER_DETAILS_BACK_LINK_HREF = '/en-gb/payment-choice'

function extractPrisonerDetailsFormValues(body: Record<string, string>): PrisonerDetailsFormValues {
  return {
    prisonerName: body['prisoner-name'],
    prisonerDobDay: body['prisoner-dob-day'],
    prisonerDobMonth: body['prisoner-dob-month'],
    prisonerDobYear: body['prisoner-dob-year'],
    prisonerNumber: body['prisoner-number'],
  }
}

function renderPrisonerDetails(
  res: Parameters<RequestHandler>[1],
  formValues: PrisonerDetailsFormValues,
  { errors, errorList }: ReturnType<typeof validatePrisonerDetails> = { errors: {}, errorList: [] },
) {
  return res.render('pages/prisoner-details', {
    backLinkHref: PRISONER_DETAILS_BACK_LINK_HREF,
    errors,
    errorList,
    formValues,
  })
}

export const prisonerDetailsGetHandler: RequestHandler = (_req, res) => {
  return renderPrisonerDetails(res, {})
}

export function prisonerDetailsPostHandler(sendMoneyToPrisonerService: SendMoneyToPrisonerService): RequestHandler {
  return async (req, res) => {
    const formValues = extractPrisonerDetailsFormValues(req.body)
    const validationResult = validatePrisonerDetails(formValues)

    if (validationResult.errorList.length > 0) {
      return renderPrisonerDetails(res, formValues, validationResult)
    }

    const validPrisoner = await sendMoneyToPrisonerService.getValidPrisoner(
      formValues.prisonerNumber as string,
      `${formValues.prisonerDobYear}-${formValues.prisonerDobMonth}-${formValues.prisonerDobDay}`,
    )

    if (validPrisoner) {
      return res.redirect('/debit-card/amount')
    }

    return renderPrisonerDetails(res, formValues)
  }
}
