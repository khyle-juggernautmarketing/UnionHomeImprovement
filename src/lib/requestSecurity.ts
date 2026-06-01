export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true

  const host = request.headers.get('host')
  if (!host) return false

  try {
    const normalize = (h: string) => h.toLowerCase().replace(/^www\./, '')
    return normalize(new URL(origin).host) === normalize(host)
  } catch {
    return false
  }
}
