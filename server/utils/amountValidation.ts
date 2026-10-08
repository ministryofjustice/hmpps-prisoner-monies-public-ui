export type AmountErrors = {
  amount?: string
}

export type AmountValidationResult = {
  errors: AmountErrors
}

function amountError(message: string) {
  return {
    errors: {
      amount: message,
    },
  }
}

export function validateAmount(_amount: string | undefined): AmountValidationResult {
  const amountAsNumber = Number(_amount)

  if (!_amount) {
    return amountError('This field is required.')
  }
  if (Number.isNaN(amountAsNumber)) {
    return amountError('Enter as a number')
  }

  if (amountAsNumber === 0) {
    return amountError('Amount should be 1p or more')
  }

  if (_amount.split('.')[1]?.length > 2) {
    return amountError('Only use 2 decimal places')
  }

  if (amountAsNumber > 200) {
    return amountError('The amount you are trying to send is too large. Please enter a smaller amount')
  }

  return { errors: {} }
}
