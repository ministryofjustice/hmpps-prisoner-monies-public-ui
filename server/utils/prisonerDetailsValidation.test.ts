import {
  validatePrisonerDetails as validatePrisonerDetailsWithT,
  prisonerNotFoundResult as prisonerNotFoundResultWithT,
  PrisonerDetailsFormValues,
} from './prisonerDetailsValidation'
import i18next, { i18nextInitPromise } from '../i18n/i18n'

const currentYear = new Date().getFullYear()

beforeAll(() => i18nextInitPromise)

type Locale = 'en-gb' | 'cy'

type PrisonerDetailsMessages = {
  required: string
  prisonerNameLabel: string
  prisonerDobLabel: string
  prisonerNumberLabel: string
  prisonerNumberFormat: string
  prisonerNameCardNumber: string
  dobDayNumber: string
  dobDayRange: string
  dobMonthNumber: string
  dobMonthRange: string
  dobYearNumber: string
  dobYearRange: (year: number) => string
  dobInvalid: string
}

const messages: Record<Locale, PrisonerDetailsMessages> = {
  'en-gb': {
    required: 'This field is required',
    prisonerNameLabel: 'Prisoner name',
    prisonerDobLabel: 'Prisoner date of birth',
    prisonerNumberLabel: 'Prisoner number',
    prisonerNumberFormat: 'Incorrect prisoner number format',
    prisonerNameCardNumber: 'Please do not enter your debit card number here',
    dobDayNumber: 'Enter ‘day’ as a number',
    dobDayRange: '‘Day’ should be between 1 and 31',
    dobMonthNumber: 'Enter ‘month’ as a number',
    dobMonthRange: '‘Month’ should be between 1 and 12',
    dobYearNumber: 'Enter ‘year’ as a number',
    dobYearRange: year => `‘Year’ should be between 1900 and ${year}`,
    dobInvalid: 'Enter a valid date',
  },
  cy: {
    required: 'Mae’n rhaid llenwi’r maes hwn',
    prisonerNameLabel: "Enw'r carcharor",
    prisonerDobLabel: "Dyddiad geni'r carcharor",
    prisonerNumberLabel: 'Rhif y carcharor',
    prisonerNumberFormat: 'Fformat anghywir ar gyfer rhif y carcharor',
    prisonerNameCardNumber: 'Peidiwch â nodi rhif eich cerdyn debyd yma',
    dobDayNumber: 'Nodwch ‘diwrnod’ fel rhif',
    dobDayRange: 'Dylai ‘Diwrnod’ fod rhwng 1 a 31',
    dobMonthNumber: 'Nodwch ‘mis’ fel rhif',
    dobMonthRange: 'Dylai ‘Mis’ fod rhwng 1 a 12',
    dobYearNumber: 'Nodwch ‘blwyddyn’ fel rhif',
    dobYearRange: year => `Dylai ‘Blwyddyn’ fod rhwng 1900 a ${year}`,
    dobInvalid: 'Nodwch ddyddiad dilys',
  },
}

const validFormValues: PrisonerDetailsFormValues = {
  prisonerName: 'John Smith',
  prisonerDobDay: '1',
  prisonerDobMonth: '2',
  prisonerDobYear: '1990',
  prisonerNumber: 'A1234BC',
}

describe.each<Locale>(['en-gb', 'cy'])('validatePrisonerDetails (%s)', locale => {
  const validatePrisonerDetails = (formValues: PrisonerDetailsFormValues) =>
    validatePrisonerDetailsWithT(formValues, i18next.getFixedT(locale))
  const expected = messages[locale]

  describe('prisoner name', () => {
    it('returns no error when the name is present', () => {
      const result = validatePrisonerDetails(validFormValues)

      expect(result.errors.prisonerName).toBeUndefined()
    })

    it('returns an error when the name is missing', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerName: undefined })

      expect(result.errors.prisonerName).toBe(expected.required)
      expect(result.errorList).toContainEqual({
        label: expected.prisonerNameLabel,
        href: '#id_prisoner_name',
        messages: [expected.required],
      })
    })

    it('returns an error when the name is an empty string', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerName: '' })

      expect(result.errors.prisonerName).toBe(expected.required)
    })

    it.each([
      '1234 5678 9012 3456',
      '1234567890123456',
      '1234-5678-9012-3456'.replace(/-/g, ' '),
      'John 1234 5678 9012 3456 Smith',
    ])('returns a card number error when the name looks like a debit card number: "%s"', cardLikeName => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerName: cardLikeName })

      expect(result.errors.prisonerName).toBe(expected.prisonerNameCardNumber)
      expect(result.errorList).toContainEqual({
        label: expected.prisonerNameLabel,
        href: '#id_prisoner_name',
        messages: [expected.prisonerNameCardNumber],
      })
    })

    it('does not flag an ordinary name containing some digits as a card number', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerName: 'Flat 12 34 Smith' })

      expect(result.errors.prisonerName).toBeUndefined()
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

      expect(result.errors.prisonerDob).toEqual([expected.required])
      expect(result.errorList).toContainEqual({
        label: expected.prisonerDobLabel,
        href: '#id_prisoner_dob_0',
        messages: [expected.required],
      })
    })

    it('returns an error when the year is before 1900', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobYear: '1899' })

      expect(result.errors.prisonerDob).toEqual([expected.dobYearRange(currentYear)])
    })

    it('returns an error when the year is after the current year', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobYear: String(currentYear + 1) })

      expect(result.errors.prisonerDob).toEqual([expected.dobYearRange(currentYear)])
    })

    it('returns an error for a day/month combination that does not exist', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '30',
        prisonerDobMonth: '2',
        prisonerDobYear: '1990',
      })

      expect(result.errors.prisonerDob).toEqual([expected.dobInvalid])
    })

    it('returns an error when only some date of birth fields are filled in', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '1',
        prisonerDobMonth: undefined,
        prisonerDobYear: undefined,
      })

      expect(result.errors.prisonerDob).toEqual([expected.required])
    })

    it('returns an error when day and month are filled in but year is missing', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '1',
        prisonerDobMonth: '2',
        prisonerDobYear: undefined,
      })

      expect(result.errors.prisonerDob).toEqual([expected.required])
    })

    it('returns an error when the day is not a number', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobDay: 'aa' })

      expect(result.errors.prisonerDob).toEqual([expected.dobDayNumber])
    })

    it('returns an error when the day is out of range', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobDay: '32' })

      expect(result.errors.prisonerDob).toEqual([expected.dobDayRange])
    })

    it('returns an error when the month is not a number', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobMonth: 'aa' })

      expect(result.errors.prisonerDob).toEqual([expected.dobMonthNumber])
    })

    it('returns an error when the month is out of range', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobMonth: '13' })

      expect(result.errors.prisonerDob).toEqual([expected.dobMonthRange])
    })

    it('returns an error when the year is not a number', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerDobYear: 'aa' })

      expect(result.errors.prisonerDob).toEqual([expected.dobYearNumber])
    })

    it('returns an error for every invalid part when day, month and year are all non-numeric', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: 'aa',
        prisonerDobMonth: 'bb',
        prisonerDobYear: 'cc',
      })

      expect(result.errors.prisonerDob).toEqual([
        expected.dobDayNumber,
        expected.dobMonthNumber,
        expected.dobYearNumber,
      ])
    })

    it('returns an error for every invalid part when day, month and year are all out of range', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '32',
        prisonerDobMonth: '13',
        prisonerDobYear: '1899',
      })

      expect(result.errors.prisonerDob).toEqual([
        expected.dobDayRange,
        expected.dobMonthRange,
        expected.dobYearRange(currentYear),
      ])
    })

    it('includes a single error-list entry for the date of birth field containing every invalid part', () => {
      const result = validatePrisonerDetails({
        ...validFormValues,
        prisonerDobDay: '32',
        prisonerDobMonth: '13',
        prisonerDobYear: '1899',
      })

      expect(result.errorList).toContainEqual({
        label: expected.prisonerDobLabel,
        href: '#id_prisoner_dob_0',
        messages: [expected.dobDayRange, expected.dobMonthRange, expected.dobYearRange(currentYear)],
      })
    })
  })

  describe('prisoner number', () => {
    it('returns no error for a validly formatted prisoner number', () => {
      const result = validatePrisonerDetails(validFormValues)

      expect(result.errors.prisonerNumber).toBeUndefined()
    })

    it('returns an error when the prisoner number is missing', () => {
      const result = validatePrisonerDetails({ ...validFormValues, prisonerNumber: undefined })

      expect(result.errors.prisonerNumber).toBe(expected.required)
      expect(result.errorList).toContainEqual({
        label: expected.prisonerNumberLabel,
        href: '#id_prisoner_number',
        messages: [expected.required],
      })
    })

    it.each(['1234BC', 'AA234BC', 'A123BC', 'A1234B', 'A1234BCD'])(
      'returns a format error for an invalid prisoner number "%s"',
      invalidNumber => {
        const result = validatePrisonerDetails({ ...validFormValues, prisonerNumber: invalidNumber })

        expect(result.errors.prisonerNumber).toBe(expected.prisonerNumberFormat)
      },
    )
  })

  describe('errorList', () => {
    it('is empty when all fields are valid', () => {
      const result = validatePrisonerDetails(validFormValues)

      expect(result.errorList).toEqual([])
    })

    it('contains one entry per field error, in name/dob/number order, with the field label as link text', () => {
      const result = validatePrisonerDetails({})

      expect(result.errorList).toEqual([
        { label: expected.prisonerNameLabel, href: '#id_prisoner_name', messages: [expected.required] },
        {
          label: expected.prisonerDobLabel,
          href: '#id_prisoner_dob_0',
          messages: [expected.required],
        },
        { label: expected.prisonerNumberLabel, href: '#id_prisoner_number', messages: [expected.required] },
      ])
    })
  })
})

// Mirrors legacy send-money's PrisonerDetailsForm.clean(), which raises a non-field
// ValidationError (code='not_found') with this message, and the legacy template's
// "What to do:" guidance shown only for that error code
// (money-to-prisoners-send-money: forms.py, prisoner-details-error-summary.html).
describe('prisonerNotFoundResult', () => {
  const prisonerNotFoundResult = () => prisonerNotFoundResultWithT(i18next.getFixedT('en-gb'))

  it('returns a single general error, not tied to a field', () => {
    const result = prisonerNotFoundResult()

    expect(result.errors).toEqual({})
    expect(result.errorList).toHaveLength(1)
    expect(result.errorList[0].href).toBeUndefined()
    expect(result.errorList[0].label).toBeUndefined()
  })

  it('matches the legacy send-money wording', () => {
    const result = prisonerNotFoundResult()

    expect(result.errorList[0].messages).toEqual(['No prisoner matches the details you’ve supplied'])
  })

  it('includes the legacy "what to do" guidance', () => {
    const result = prisonerNotFoundResult()

    expect(result.errorList[0].guidance).toEqual([
      'Check you’ve entered the details correctly',
      'Ask the person in prison to check with their wing officer that your details match theirs',
      'If your details are wrong, use the new details you’ve been given',
      'If the prison details are wrong, the person in prison needs to submit a general application to the Offender Management Unit querying their details',
    ])
  })
})
