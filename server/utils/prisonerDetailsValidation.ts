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
const requiredFieldError = 'This field is required.'

function isValidDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

// Mirrors Django's SplitDateField/MultiValueField.clean(): if any part is missing, a single
// 'required' error is raised immediately. Otherwise, each part (day, month, year) is validated
// independently and ALL resulting errors are collected (not just the first one found), only
// falling back to a single 'Enter a valid date' error once every individual part is itself valid.
function validatePrisonerDob(formValues: PrisonerDetailsFormValues): string[] {
  if (!formValues.prisonerDobDay || !formValues.prisonerDobMonth || !formValues.prisonerDobYear) {
    return [requiredFieldError]
  }

  const day = Number(formValues.prisonerDobDay)
  const month = Number(formValues.prisonerDobMonth)
  const year = Number(formValues.prisonerDobYear)
  const currentYear = new Date().getFullYear()

  const fieldErrors: string[] = []

  if (Number.isNaN(day)) {
    fieldErrors.push('Enter ‘day’ as a number')
  } else if (day < 1 || day > 31) {
    fieldErrors.push('‘Day’ should be between 1 and 31')
  }

  if (Number.isNaN(month)) {
    fieldErrors.push('Enter ‘month’ as a number')
  } else if (month < 1 || month > 12) {
    fieldErrors.push('‘Month’ should be between 1 and 12')
  }

  if (Number.isNaN(year)) {
    fieldErrors.push('Enter ‘year’ as a number')
  } else if (year < 1900 || year > currentYear) {
    fieldErrors.push(`‘Year’ should be between 1900 and ${currentYear}`)
  }

  if (fieldErrors.length > 0) {
    return fieldErrors
  }

  if (!isValidDate(day, month, year)) {
    return ['Enter a valid date']
  }

  return []
}

export function validatePrisonerDetails(formValues: PrisonerDetailsFormValues): PrisonerDetailsValidationResult {
  const errors: PrisonerDetailsErrors = {}

  if (!formValues.prisonerName) {
    errors.prisonerName = requiredFieldError
  }

  const prisonerDobErrors = validatePrisonerDob(formValues)
  if (prisonerDobErrors.length > 0) {
    errors.prisonerDob = prisonerDobErrors
  }

  if (!formValues.prisonerNumber) {
    errors.prisonerNumber = requiredFieldError
  } else if (!prisonerNumberRegex.test(formValues.prisonerNumber)) {
    errors.prisonerNumber = 'Incorrect prisoner number format'
  }

  const errorList: PrisonerDetailsErrorListItem[] = []
  if (errors.prisonerName) {
    errorList.push({ label: 'Prisoner name', href: '#id_prisoner_name-label', messages: [errors.prisonerName] })
  }
  if (errors.prisonerDob) {
    errorList.push({
      label: 'Prisoner date of birth',
      href: '#id_prisoner_dob_0-label',
      messages: errors.prisonerDob,
    })
  }
  if (errors.prisonerNumber) {
    errorList.push({ label: 'Prisoner number', href: '#id_prisoner_number-label', messages: [errors.prisonerNumber] })
  }

  return { errors, errorList }
}
