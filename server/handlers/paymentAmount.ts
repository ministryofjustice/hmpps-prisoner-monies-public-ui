import { RequestHandler } from 'express'
import { AmountFormValues, validateAmount } from '../utils/amountValidation'

function renderPaymentAmount(
  res: Parameters<RequestHandler>[1],
  formValues: AmountFormValues,
  { errors, errorList }: ReturnType<typeof validateAmount> = { errors: {}, errorList: [] },
) {
  return res.render('pages/payment-amount', {
    errors,
    errorList,
    formValues,
  })
}

export const paymentAmountGetHandler: RequestHandler = (_req, res) => {
  return renderPaymentAmount(res, {})
}

export function paymentAmountPostHandler(): RequestHandler {
  return async (req, res) => {
    const formValues = req.body
    const validationResult = validateAmount(formValues.amount)

    if (validationResult.errorList.length > 0) {
      return renderPaymentAmount(res, formValues, validationResult)
    }
    return res.redirect('/debit-card/check')
  }
}
