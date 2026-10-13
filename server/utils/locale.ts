export const SUPPORTED_LANGUAGES = ['en-gb', 'cy'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en-gb'

const SUPPORTED_LANGUAGE_SET: ReadonlySet<string> = new Set(SUPPORTED_LANGUAGES)

export function detectLocaleFromPath(path: string): SupportedLanguage {
  const firstSegment = path.split('/').filter(Boolean)[0]
  return SUPPORTED_LANGUAGE_SET.has(firstSegment) ? (firstSegment as SupportedLanguage) : DEFAULT_LANGUAGE
}

export const buildLocalePath =
  (locale: string) =>
  (path: string): string =>
    `/${locale}${path.startsWith('/') ? path : `/${path}`}`
