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

function isValidDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

// Mirrors Django's SplitDateField/MultiValueField.clean(): if any part is missing, a single
// 'required' error is raised immediately. Otherwise, each part (day, month, year) is validated
// independently and ALL resulting errors are collected (not just the first one found), only
// falling back to a single 'Enter a valid date' error once every individual part is itself valid.
function validatePrisonerDob(formValues: PrisonerDetailsFormValues, t: TFunction): string[] {
  if (!formValues.prisonerDobDay || !formValues.prisonerDobMonth || !formValues.prisonerDobYear) {
    return [t('prisonerDetails.step1.errors.required')]
  }

  const day = Number(formValues.prisonerDobDay)
  const month = Number(formValues.prisonerDobMonth)
  const year = Number(formValues.prisonerDobYear)
  const currentYear = new Date().getFullYear()

  const fieldErrors: string[] = []

  if (Number.isNaN(day)) {
    fieldErrors.push(t('prisonerDetails.step1.errors.dobDayNumber'))
  } else if (day < 1 || day > 31) {
    fieldErrors.push(t('prisonerDetails.step1.errors.dobDayRange'))
  }

  if (Number.isNaN(month)) {
    fieldErrors.push(t('prisonerDetails.step1.errors.dobMonthNumber'))
  } else if (month < 1 || month > 12) {
    fieldErrors.push(t('prisonerDetails.step1.errors.dobMonthRange'))
  }

  if (Number.isNaN(year)) {
    fieldErrors.push(t('prisonerDetails.step1.errors.dobYearNumber'))
  } else if (year < 1900 || year > currentYear) {
    fieldErrors.push(t('prisonerDetails.step1.errors.dobYearRange', { currentYear }))
  }

  if (fieldErrors.length > 0) {
    return fieldErrors
  }

  if (!isValidDate(day, month, year)) {
    return [t('prisonerDetails.step1.errors.dobInvalid')]
  }

  return []
}

export function validatePrisonerDetails(
  formValues: PrisonerDetailsFormValues,
  t: TFunction,
): PrisonerDetailsValidationResult {
  const errors: PrisonerDetailsErrors = {}

  if (!formValues.prisonerName) {
    errors.prisonerName = t('prisonerDetails.step1.errors.required')
  }

  const prisonerDobErrors = validatePrisonerDob(formValues, t)
  if (prisonerDobErrors.length > 0) {
    errors.prisonerDob = prisonerDobErrors
  }

  if (!formValues.prisonerNumber) {
    errors.prisonerNumber = t('prisonerDetails.step1.errors.required')
  } else if (!prisonerNumberRegex.test(formValues.prisonerNumber)) {
    errors.prisonerNumber = t('prisonerDetails.step1.errors.prisonerNumberFormat')
  }

  const errorList: PrisonerDetailsErrorListItem[] = []
  if (errors.prisonerName) {
    errorList.push({
      label: t('prisonerDetails.step1.fields.prisonerName.label'),
      href: '#id_prisoner_name-label',
      messages: [errors.prisonerName],
    })
  }
  if (errors.prisonerDob) {
    errorList.push({
      label: t('prisonerDetails.step1.fields.prisonerDob.legend'),
      href: '#id_prisoner_dob_0-label',
      messages: errors.prisonerDob,
    })
  }
  if (errors.prisonerNumber) {
    errorList.push({
      label: t('prisonerDetails.step1.fields.prisonerNumber.label'),
      href: '#id_prisoner_number-label',
      messages: [errors.prisonerNumber],
    })
  }

  return { errors, errorList }
}
