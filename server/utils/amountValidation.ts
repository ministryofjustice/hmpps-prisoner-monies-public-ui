export type AmountErrors = {
  amount?: string
}

export type AmountValidationErrorListItem = {
  label: string
  href: string
  messages: string[]
}

export type AmountValidationResult = {
  errors: AmountErrors
  errorList: AmountValidationErrorListItem[]
}

export function validateAmount(_amount: string | undefined): AmountValidationResult {
  const errors: AmountErrors = {}
  const errorList: AmountValidationErrorListItem[] = []

  if (!_amount) {
    errors.amount = 'This field is required.'
  } else {
    const amountAsNumber = Number(_amount)

    if (Number.isNaN(amountAsNumber)) {
      errors.amount = 'Enter as a number'
    } else if (amountAsNumber === 0) {
      errors.amount = 'Amount should be 1p or more'
    } else if (_amount.split('.')[1]?.length > 2) {
      errors.amount = 'Only use 2 decimal places'
    } else if (amountAsNumber > 200) {
      errors.amount = 'The amount you are trying to send is too large. Please enter a smaller amount'
    }
  }

  if (errors.amount) {
    errorList.push({ label: 'Amount', href: '#id_amount-label', messages: [errors.amount] })
  }

  return { errors, errorList }
}
