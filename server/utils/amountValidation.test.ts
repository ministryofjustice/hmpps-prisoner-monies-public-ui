import { validateAmount as validateAmountWithT } from './amountValidation'
import i18next, { i18nextInitPromise } from '../i18n/i18n'

beforeAll(() => i18nextInitPromise)

type Locale = 'en-gb' | 'cy'

type AmountMessages = {
  label: string
  required: string
  notANumber: string
  tooSmall: string
  tooManyDecimalPlaces: string
  tooLarge: string
}

const messages: Record<Locale, AmountMessages> = {
  'en-gb': {
    label: 'Amount',
    required: 'This field is required.',
    notANumber: 'Enter as a number',
    tooSmall: 'Amount should be 1p or more',
    tooManyDecimalPlaces: 'Only use 2 decimal places',
    tooLarge: 'The amount you are trying to send is too large. Please enter a smaller amount',
  },
  cy: {
    label: 'Swm',
    required: 'Mae’n rhaid llenwi’r maes hwn.',
    notANumber: 'Nodwch fel rhif',
    tooSmall: "Dylai'r swm fod yn 1c neu fwy",
    tooManyDecimalPlaces: 'Defnyddiwch 2 le degol yn unig',
    tooLarge: "Mae'r swm rydych yn ceisio ei anfon yn rhy fawr. Nodwch swm llai",
  },
}

describe.each<Locale>(['en-gb', 'cy'])('validateAmount (%s)', locale => {
  const validateAmount = (amount: string | undefined) => validateAmountWithT(amount, i18next.getFixedT(locale))
  const expected = messages[locale]

  it('returns no error for a valid whole-pound amount', () => {
    const result = validateAmount('17')

    expect(result.errors.amount).toBeUndefined()
  })

  it('returns an error when the amount is missing', () => {
    const result = validateAmount(undefined)

    expect(result.errors.amount).toBe(expected.required)
  })

  it('returns an "Enter as a number" error when the amount is not numeric', () => {
    const result = validateAmount('abc')

    expect(result.errors.amount).toBe(expected.notANumber)
  })

  it('returns a "1p or more" error when the amount is zero', () => {
    const result = validateAmount('0')

    expect(result.errors.amount).toBe(expected.tooSmall)
  })

  it('returns an "Only use 2 decimal places" error when the amount has more than 2 decimal places', () => {
    const result = validateAmount('17.999')

    expect(result.errors.amount).toBe(expected.tooManyDecimalPlaces)
  })

  it('returns a "too large" error when the amount is more than £200', () => {
    const result = validateAmount('200.01')

    expect(result.errors.amount).toBe(expected.tooLarge)
  })

  it('returns an empty errorList for a valid amount', () => {
    const result = validateAmount('17')

    expect(result.errorList).toEqual([])
  })

  it('returns an errorList entry pointing at the amount field when invalid', () => {
    const result = validateAmount(undefined)

    expect(result.errorList).toEqual([{ label: expected.label, href: '#id_amount', messages: [expected.required] }])
  })
})
