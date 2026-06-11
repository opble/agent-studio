/** Returns a user-facing message for an API error. */
export function getApiErrorMessage(
  error: unknown,
  fallback: string = 'Something went wrong. Check your Mastra server connection.'
): string {
  if (error != null && typeof error === 'object' && 'status' in error) {
    if (error.status === 403) {
      return 'You do not have permission to access this feature.'
    }
  }
  return fallback
}
