export type AmountErrors = {
  amount?: string
}

export type AmountValidationResult = {
  errors: AmountErrors
}

export function validateAmount(_amount: string | undefined): AmountValidationResult {
  if (!_amount) {
    return {
      errors: {
        amount: 'This field is required.',
      },
    }
  }
  if (Number.isNaN(Number(_amount))) {
    return {
      errors: {
        amount: 'Enter as a number',
      },
    }
  }

  if (Number(_amount) === 0) {
    return { errors: { amount: 'Amount should be 1p or more' } }
  }

  if (_amount.split('.')[1]?.length > 2) {
    return { errors: { amount: 'Only use 2 decimal places' } }
  }
  if (Number(_amount) > 200) {
    return { errors: { amount: 'The amount you are trying to send is too large. Please enter a smaller amount' } }
  }

  return { errors: {} }
}
