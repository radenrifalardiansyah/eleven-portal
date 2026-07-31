/** Coarse device classification for analytics aggregation — not a precise
 *  UA parser, mirrors lib/auth/login-history.ts's detectDeviceLabel but
 *  returns the lowercase enum values analytics_events.device_type expects. */
export function classifyDevice(userAgent: string): "desktop" | "mobile" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

/** Coarse browser label, checked in an order that resolves the usual
 *  UA-string ambiguities (Edge/Chrome both contain "safari" and "chrome"). */
export function classifyBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/edg\//.test(ua)) return "Edge";
  if (/opr\/|opera/.test(ua)) return "Opera";
  if (/firefox/.test(ua)) return "Firefox";
  if (/chrome|crios/.test(ua)) return "Chrome";
  if (/safari/.test(ua)) return "Safari";
  return "Lainnya";
}
