import { buildLocalePath, detectLocaleFromPath, DEFAULT_LANGUAGE } from './locale'

describe('buildLocalePath', () => {
  it.each([
    ['locale with leading-slash path', 'en-gb', '/terms', '/en-gb/terms'],
    ['locale with path missing leading slash', 'en-gb', 'terms', '/en-gb/terms'],
    ['different locale', 'cy', '/cookies', '/cy/cookies'],
    ['root path', 'en-gb', '/', '/en-gb/'],
    // note: pages not under a locale prefix (e.g. HomePage) don't call buildLocalePath with an empty locale - they build their own path instead
    ['empty locale produces a double slash', '', '/start-page', '//start-page'],
  ])('%s', (_: string, locale: string, path: string, expected: string) => {
    expect(buildLocalePath(locale)(path)).toEqual(expected)
  })
})

describe('detectLocaleFromPath', () => {
  it.each([
    ['supported locale prefix', '/en-gb/terms', 'en-gb'],
    ['other supported locale prefix', '/cy/terms', 'cy'],
    ['unsupported prefix falls back to default', '/fr/terms', DEFAULT_LANGUAGE],
    ['no prefix falls back to default', '/', DEFAULT_LANGUAGE],
    ['empty path falls back to default', '', DEFAULT_LANGUAGE],
  ])('%s', (_: string, path: string, expected: string) => {
    expect(detectLocaleFromPath(path)).toEqual(expected)
  })
})
