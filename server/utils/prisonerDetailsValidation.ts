import type { TFunction } from 'i18next'

export type PrisonerDetailsFormValues = {
  prisonerName?: string
  prisonerDobDay?: string
  prisonerDobMonth?: string
  prisonerDobYear?: string
  prisonerNumber?: string
}

export type PrisonerDetailsErrors = {
  prisonerName?: string
  prisonerDob?: string[]
  prisonerNumber?: string
}

export type PrisonerDetailsErrorListItem = {
  label: string
  href: string
  messages: string[]
}

export type PrisonerDetailsValidationResult = {
  errors: PrisonerDetailsErrors
  errorList: PrisonerDetailsErrorListItem[]
}

const prisonerNumberRegex = /^[a-zA-Z]\d{4}[a-zA-Z]{2}$/

const cardNumberRegex = /\d{4}\s*\d{4}\s*\d{4}\s*\d{4}/

function isValidDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function validatePrisonerDob(formValues: PrisonerDetailsFormValues, t: TFunction): string[] {
  if (!formValues.prisonerDobDay || !formValues.prisonerDobMonth || !formValues.prisonerDobYear) {
    return [t('prisonerDetails.errors.required')]
  }

  const day = Number(formValues.prisonerDobDay)
  const month = Number(formValues.prisonerDobMonth)
  const year = Number(formValues.prisonerDobYear)
  const currentYear = new Date().getFullYear()

  const fieldErrors: string[] = []

  if (Number.isNaN(day)) {
    fieldErrors.push(t('prisonerDetails.errors.dobDayNumber'))
  } else if (day < 1 || day > 31) {
    fieldErrors.push(t('prisonerDetails.errors.dobDayRange'))
  }

  if (Number.isNaN(month)) {
    fieldErrors.push(t('prisonerDetails.errors.dobMonthNumber'))
  } else if (month < 1 || month > 12) {
    fieldErrors.push(t('prisonerDetails.errors.dobMonthRange'))
  }

  if (Number.isNaN(year)) {
    fieldErrors.push(t('prisonerDetails.errors.dobYearNumber'))
  } else if (year < 1900 || year > currentYear) {
    fieldErrors.push(t('prisonerDetails.errors.dobYearRange', { currentYear }))
  }

  if (fieldErrors.length > 0) {
    return fieldErrors
  }

  if (!isValidDate(day, month, year)) {
    return [t('prisonerDetails.errors.dobInvalid')]
  }

  return []
}

export function validatePrisonerDetails(
  formValues: PrisonerDetailsFormValues,
  t: TFunction,
): PrisonerDetailsValidationResult {
  const errors: PrisonerDetailsErrors = {}

  if (!formValues.prisonerName) {
    errors.prisonerName = t('prisonerDetails.errors.required')
  } else if (cardNumberRegex.test(formValues.prisonerName)) {
    errors.prisonerName = t('prisonerDetails.errors.prisonerNameCardNumber')
  }

  const prisonerDobErrors = validatePrisonerDob(formValues, t)
  if (prisonerDobErrors.length > 0) {
    errors.prisonerDob = prisonerDobErrors
  }

  if (!formValues.prisonerNumber) {
    errors.prisonerNumber = t('prisonerDetails.errors.required')
  } else if (!prisonerNumberRegex.test(formValues.prisonerNumber)) {
    errors.prisonerNumber = t('prisonerDetails.errors.prisonerNumberFormat')
  }

  const errorList: PrisonerDetailsErrorListItem[] = []
  if (errors.prisonerName) {
    errorList.push({
      label: t('prisonerDetails.fields.prisonerName.label'),
      href: '#id_prisoner_name',
      messages: [errors.prisonerName],
    })
  }
  if (errors.prisonerDob) {
    errorList.push({
      label: t('prisonerDetails.fields.prisonerDob.legend'),
      href: '#id_prisoner_dob_0',
      messages: errors.prisonerDob,
    })
  }
  if (errors.prisonerNumber) {
    errorList.push({
      label: t('prisonerDetails.fields.prisonerNumber.label'),
      href: '#id_prisoner_number',
      messages: [errors.prisonerNumber],
    })
  }

  return { errors, errorList }
}
