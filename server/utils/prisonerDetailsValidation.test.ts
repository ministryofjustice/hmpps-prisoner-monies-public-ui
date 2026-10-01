import { validatePrisonerDetails, PrisonerDetailsFormValues } from './prisonerDetailsValidation'

const currentYear = new Date().getFullYear()

const validFormValues: PrisonerDetailsFormValues = {
  prisonerName: 'John Smith',
  prisonerDobDay: '1',
  prisonerDobMonth: '2',
  prisonerDobYear: '1990',
  prisonerNumber: 'A1234BC',
}

describe('validatePrisonerDetails', () => {
  describe('prisoner name', () => {
    it('returns no error when the name is present', () => {
      const result = validatePrisonerDetails(validFormValues)

      expect(result.errors.prisonerName).toBeUndefined()
    })

    it('returns an error when the name is missing', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerName: undefined })

      expect(result.errors.prisonerName).toBe('This field is required.')
      expect(result.errorList).toContainEqual({ text: 'This field is required.', href: '#id_prisoner_name-label' })
    })

    it('returns an error when the name is an empty string', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerName: '' })

      expect(result.errors.prisonerName).toBe('This field is required.')
    })
  })

  describe('prisoner date of birth', () => {
    it('returns no error for a valid date of birth', () => {
      const result = validatePrisonerDetails(validFormValues)

      expect(result.errors.prisonerDob).toBeUndefined()
    })

    it('returns an error when all date of birth fields are missing', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: undefined,
        prisonerDobMonth: undefined,
        prisonerDobYear: undefined,
      })

      expect(result.errors.prisonerDob).toBe('This field is required.')
      expect(result.errorList).toContainEqual({
        text: 'This field is required.',
        href: '#id_prisoner_dob_0-label',
      })
    })

    it('returns an error when the year is before 1900', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobYear: '1899' })

      expect(result.errors.prisonerDob).toBe(`‘Year’ should be between 1900 and ${currentYear}`)
    })

    it('returns an error when the year is after the current year', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobYear: String(currentYear + 1) })

      expect(result.errors.prisonerDob).toBe(`‘Year’ should be between 1900 and ${currentYear}`)
    })

    it('returns an error for a day/month combination that does not exist', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '30',
        prisonerDobMonth: '2',
        prisonerDobYear: '1990',
      })

      expect(result.errors.prisonerDob).toBe('Enter a valid date')
    })

    it('returns an error when only some date of birth fields are filled in', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '1',
        prisonerDobMonth: undefined,
        prisonerDobYear: undefined,
      })

      expect(result.errors.prisonerDob).toBe('This field is required.')
    })

    it('returns an error when day and month are filled in but year is missing', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '1',
        prisonerDobMonth: '2',
        prisonerDobYear: undefined,
      })

      expect(result.errors.prisonerDob).toBe('This field is required.')
    })

    it('returns an error when the day is not a number', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobDay: 'aa' })

      expect(result.errors.prisonerDob).toBe('Enter ‘day’ as a number')
    })

    it('returns an error when the day is out of range', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobDay: '32' })

      expect(result.errors.prisonerDob).toBe('‘Day’ should be between 1 and 31')
    })

    it('returns an error when the month is not a number', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobMonth: 'aa' })

      expect(result.errors.prisonerDob).toBe('Enter ‘month’ as a number')
    })

    it('returns an error when the month is out of range', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobMonth: '13' })

      expect(result.errors.prisonerDob).toBe('‘Month’ should be between 1 and 12')
    })

    it('returns an error when the year is not a number', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobYear: 'aa' })

      expect(result.errors.prisonerDob).toBe('Enter ‘year’ as a number')
    })
  })

  describe('prisoner number', () => {
    it('returns no error for a validly formatted prisoner number', () => {
      const result = validatePrisonerDetails(validFormValues)

      expect(result.errors.prisonerNumber).toBeUndefined()
    })

    it('returns an error when the prisoner number is missing', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerNumber: undefined })

      expect(result.errors.prisonerNumber).toBe('This field is required.')
      expect(result.errorList).toContainEqual({
        text: 'This field is required.',
        href: '#id_prisoner_number-label',
      })
    })

    it.each(['1234BC', 'AA234BC', 'A123BC', 'A1234B', 'A1234BCD'])(
      'returns a format error for an invalid prisoner number "%s"',
      invalidNumber => {
        const result = validatePrisonerDetails({ ...validFormValues, prisonerNumber: invalidNumber })

        expect(result.errors.prisonerNumber).toBe('Incorrect prisoner number format')
      },
    )
  })

  describe('errorList', () => {
    it('is empty when all fields are valid', () => {
      const result = validatePrisonerDetails(validFormValues)

      expect(result.errorList).toEqual([])
    })

    it('contains one entry per field error, in name/dob/number order', () => {
      const result = validatePrisonerDetails({})

      expect(result.errorList).toEqual([
        { text: 'This field is required.', href: '#id_prisoner_name-label' },
        { text: 'This field is required.', href: '#id_prisoner_dob_0-label' },
        { text: 'This field is required.', href: '#id_prisoner_number-label' },
      ])
    })
  })
})
