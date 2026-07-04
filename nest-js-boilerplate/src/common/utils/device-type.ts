export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';

export function parseDeviceType(userAgent?: string | null): DeviceType {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  if (
    /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|headless/i.test(
      ua,
    )
  ) {
    return 'bot';
  }

  if (/ipad|tablet|playbook|silk|kindle|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }

  if (
    /mobile|iphone|ipod|blackberry|opera mini|opera mobi|android.*mobile|windows phone|iemobile/i.test(
      ua,
    )
  ) {
    return 'mobile';
  }

  return 'desktop';
}
