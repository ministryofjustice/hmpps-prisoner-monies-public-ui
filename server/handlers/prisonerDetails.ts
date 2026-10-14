import type { RequestHandler } from 'express'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'
import { validatePrisonerDetails, PrisonerDetailsFormValues } from '../utils/prisonerDetailsValidation'

export const PRISONER_DETAILS_BACK_LINK_HREF = '/payment-choice'

function extractPrisonerDetailsFormValues(body: Record<string, string>): PrisonerDetailsFormValues {
  return {
    prisonerName: body.prisoner_name,
    prisonerDobDay: body.prisoner_dob_0,
    prisonerDobMonth: body.prisoner_dob_1,
    prisonerDobYear: body.prisoner_dob_2,
    prisonerNumber: body.prisoner_number,
  }
}

function renderPrisonerDetails(
  res: Parameters<RequestHandler>[1],
  formValues: PrisonerDetailsFormValues,
  { errors, errorList }: ReturnType<typeof validatePrisonerDetails> = { errors: {}, errorList: [] },
) {
  return res.render('pages/prisoner-details', {
    backLinkHref: res.locals.localePath(PRISONER_DETAILS_BACK_LINK_HREF),
    postDebitCardDetails: res.locals.localePath('/debit-card/details'),
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
      return res.redirect(res.locals.localePath('/debit-card/amount'))
    }

    return renderPrisonerDetails(res, formValues)
  }
}
