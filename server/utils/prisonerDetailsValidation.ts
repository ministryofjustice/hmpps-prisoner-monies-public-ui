export type PrisonerDetailsFormValues = {
  prisonerName?: string
  prisonerDobDay?: string
  prisonerDobMonth?: string
  prisonerDobYear?: string
  prisonerNumber?: string
}

export type PrisonerDetailsErrors = {
  prisonerName?: string
  prisonerDob?: string
  prisonerNumber?: string
}

export type PrisonerDetailsValidationResult = {
  errors: PrisonerDetailsErrors
  errorList: { text: string; href: string }[]
}

const prisonerNumberRegex = /^[a-zA-Z]\d{4}[a-zA-Z]{2}$/

function isValidDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function validatePrisonerDetails(formValues: PrisonerDetailsFormValues): PrisonerDetailsValidationResult {
  const errors: PrisonerDetailsErrors = {}

  if (!formValues.prisonerName) {
    errors.prisonerName = 'Enter the prisoner’s name'
  }

  if (!formValues.prisonerDobDay || !formValues.prisonerDobMonth || !formValues.prisonerDobYear) {
    errors.prisonerDob = 'Enter the prisoner’s date of birth'
  } else {
    const day = Number(formValues.prisonerDobDay)
    const month = Number(formValues.prisonerDobMonth)
    const year = Number(formValues.prisonerDobYear)
    const currentYear = new Date().getFullYear()
    if (year < 1900 || year > currentYear) {
      errors.prisonerDob = `‘Year’ should be between 1900 and ${currentYear}`
    } else if (!isValidDate(day, month, year)) {
      errors.prisonerDob = 'Enter a valid date of birth'
    }
  }

  if (!formValues.prisonerNumber) {
    errors.prisonerNumber = 'Enter the prisoner’s number'
  } else if (!prisonerNumberRegex.test(formValues.prisonerNumber)) {
    errors.prisonerNumber = 'Incorrect prisoner number format'
  }

  const errorList: { text: string; href: string }[] = []
  if (errors.prisonerName) {
    errorList.push({ text: errors.prisonerName, href: '#id_prisoner_name-label' })
  }
  if (errors.prisonerDob) {
    errorList.push({ text: errors.prisonerDob, href: '#id_prisoner_dob_0-label' })
  }
  if (errors.prisonerNumber) {
    errorList.push({ text: errors.prisonerNumber, href: '#id_prisoner_number-label' })
  }

  return { errors, errorList }
}
