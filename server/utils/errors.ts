export enum ScrapeError {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  PRIVATE_PROFILE = 'PRIVATE_PROFILE',
}

export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

export function errorToStatusCode(error: string) {
  switch (error) {
    case ScrapeError.PROFILE_NOT_FOUND:
      return 404
    case ScrapeError.PRIVATE_PROFILE:
      return 403
    default:
      return 500
  }
}
