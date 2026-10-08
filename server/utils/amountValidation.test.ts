import { validateAmount } from './amountValidation'

describe('validateAmount', () => {
  it('returns no error for a valid whole-pound amount', () => {
    const result = validateAmount('17')

    expect(result.errors.amount).toBeUndefined()
  })

  it('returns an error when the amount is missing', () => {
    const result = validateAmount(undefined)

    expect(result.errors.amount).toBe('This field is required.')
  })

  it('returns an "Enter as a number" error when the amount is not numeric', () => {
    const result = validateAmount('abc')

    expect(result.errors.amount).toBe('Enter as a number')
  })

  it('returns a "1p or more" error when the amount is zero', () => {
    const result = validateAmount('0')

    expect(result.errors.amount).toBe('Amount should be 1p or more')
  })

  it('returns an "Only use 2 decimal places" error when the amount has more than 2 decimal places', () => {
    const result = validateAmount('17.999')

    expect(result.errors.amount).toBe('Only use 2 decimal places')
  })

  it('returns a "too large" error when the amount is more than £200', () => {
    const result = validateAmount('200.01')

    expect(result.errors.amount).toBe('The amount you are trying to send is too large. Please enter a smaller amount')
  })
})
