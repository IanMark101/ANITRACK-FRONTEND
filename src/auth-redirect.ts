export function safeAuthRedirect(value: unknown): string {
  return typeof value === 'string' &&
    /^\/(?:dashboard|watchlist|calendar|discover|assistant|anime\/(?:kitsu|local)\/[a-zA-Z0-9-]+)(?:[?#].*)?$/.test(
      value
    )
    ? value
    : '/dashboard';
}
