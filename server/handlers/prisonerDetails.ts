import type { RequestHandler } from 'express'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'
import { validatePrisonerDetails, PrisonerDetailsFormValues } from '../utils/prisonerDetailsValidation'
import { paths, debitCardPaths } from '../constants/paths'

export const PRISONER_DETAILS_BACK_LINK_HREF = paths.PAYMENT_CHOICE

function extractPrisonerDetailsFormValues(body: Record<string, string>): PrisonerDetailsFormValues {
  return {
    prisonerName: body.prisoner_name,
    prisonerDobDay: body.prisoner_dob_0,
    prisonerDobMonth: body.prisoner_dob_1,
    prisonerDobYear: body.prisoner_dob_2,
    prisonerNumber: body.prisoner_number,
  }
}
function formatPrisonerDetails(formValues: PrisonerDetailsFormValues) {
  return {
    ...formValues,
    prisonerName: typeof formValues.prisonerName === 'string' ? formValues.prisonerName.trim() : '',
    prisonerNumber: typeof formValues.prisonerNumber === 'string' ? formValues.prisonerNumber.trim().toUpperCase() : '',
  }
}

function buildPrisonerDob({ prisonerDobDay, prisonerDobMonth, prisonerDobYear }: PrisonerDetailsFormValues): string {
  return `${prisonerDobDay}-${prisonerDobMonth}-${prisonerDobYear}`
}

function renderPrisonerDetails(
  res: Parameters<RequestHandler>[1],
  formValues: PrisonerDetailsFormValues,
  { errors, errorList }: ReturnType<typeof validatePrisonerDetails> = { errors: {}, errorList: [] },
) {
  return res.render('pages/prisoner-details', {
    backLinkHref: res.locals.localePath(PRISONER_DETAILS_BACK_LINK_HREF),
    postDebitCardDetails: res.locals.localePath(debitCardPaths.PRISONER_DETAILS),
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
    const formattedFormValues = formatPrisonerDetails(formValues)
    const validationResult = validatePrisonerDetails(formattedFormValues, res.locals.t)

    if (validationResult.errorList.length > 0) {
      return renderPrisonerDetails(res, formValues, validationResult)
    }

    const { prisonerName, prisonerNumber } = formattedFormValues
    const prisonerDOB = buildPrisonerDob(formattedFormValues)
    const validPrisoner = await sendMoneyToPrisonerService.getValidPrisoner(prisonerNumber, prisonerDOB)

    if (!validPrisoner) {
      // renders form values as they were submitted rather than the formatted values
      return renderPrisonerDetails(res, formValues)
    }

    req.session = req.session ?? {}
    req.session.sendMoney = {
      ...req.session.sendMoney,
      prisonerName,
      prisonerDOB,
      prisonerNumber,
    }
    return res.redirect(res.locals.localePath(debitCardPaths.PAYMENT_AMOUNT))
  }
}
