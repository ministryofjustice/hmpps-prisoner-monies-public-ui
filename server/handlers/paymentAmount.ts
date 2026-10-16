import { RequestHandler } from 'express'
import { AmountFormValues, validateAmount } from '../utils/amountValidation'
import paths from '../constants/paths'

function renderPaymentAmount(
  res: Parameters<RequestHandler>[1],
  formValues: AmountFormValues,
  { errors, errorList }: ReturnType<typeof validateAmount> = { errors: {}, errorList: [] },
) {
  return res.render('pages/payment-amount', {
    postPaymentAmount: res.locals.localePath(`${paths.DEBIT_CARD.ROOT}${paths.DEBIT_CARD.AMOUNT}`),
    errors,
    errorList,
    formValues,
  })
}

export const paymentAmountGetHandler: RequestHandler = (_req, res) => {
  return renderPaymentAmount(res, {})
}

export function paymentAmountPostHandler(): RequestHandler {
  return (req, res) => {
    const formValues = req.body
    const validationResult = validateAmount(formValues.amount, res.locals.t)

    if (validationResult.errorList.length > 0) {
      return renderPaymentAmount(res, formValues, validationResult)
    }
    req.session.sendMoney = { ...req.session.sendMoney, amount: formValues.amount }
    return res.redirect(res.locals.localePath(`${paths.DEBIT_CARD.ROOT}${paths.DEBIT_CARD.CHECK}`))
  }
}
