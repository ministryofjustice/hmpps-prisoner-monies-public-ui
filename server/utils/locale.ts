export const SUPPORTED_LANGUAGES: Record<string, 'en-gb' | 'cy'> = {
  'en-gb': 'en-gb',
  cy: 'cy',
}
export const DEFAULT_LANGUAGE = 'en-gb'

export function detectLocaleFromPath(path: string): 'en-gb' | 'cy' {
  const firstSegment = path.split('/').filter(Boolean)[0]
  return SUPPORTED_LANGUAGES[firstSegment] ?? DEFAULT_LANGUAGE
}

export function buildLocalePath(locale: string, path: string): string {
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`
}
