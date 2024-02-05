export enum ScrapeError {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
}

export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

export function errorToStatusCode(error: string) {
  switch (error) {
    case ScrapeError.PROFILE_NOT_FOUND:
      return 404
    default:
      return 500
  }
}
