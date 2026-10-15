import type { TFunction } from 'i18next'

export type AmountFormValues = {
  amount?: string
}

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

export function validateAmount(_amount: string | undefined, t: TFunction): AmountValidationResult {
  const errors: AmountErrors = {}
  const errorList: AmountValidationErrorListItem[] = []

  if (!_amount) {
    errors.amount = t('paymentAmount.errors.required')
  } else {
    const amountAsNumber = Number(_amount)

    if (Number.isNaN(amountAsNumber)) {
      errors.amount = t('paymentAmount.errors.notANumber')
    } else if (amountAsNumber === 0) {
      errors.amount = t('paymentAmount.errors.tooSmall')
    } else if (_amount.split('.')[1]?.length > 2) {
      errors.amount = t('paymentAmount.errors.tooManyDecimalPlaces')
    } else if (amountAsNumber > 200) {
      errors.amount = t('paymentAmount.errors.tooLarge')
    }
  }

  if (errors.amount) {
    errorList.push({ label: t('paymentAmount.fields.amount.label'), href: '#id_amount', messages: [errors.amount] })
  }

  return { errors, errorList }
}
