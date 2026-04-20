/**
 * PII-safe logger.
 *
 * Nigerian Data Protection Regulation (NDPR) prohibits persisting raw BVN /
 * NIN / phone / card in app logs. Every log statement goes through this
 * wrapper which masks well-known PII field names before emitting.
 *
 * In dev only (`__DEV__`), we also emit through `console.warn` so the React
 * Native YellowBox surfaces issues. In production we drop logs on the floor —
 * real telemetry will be swapped in with the analytics layer later.
 */

const PII_FIELDS = new Set([
  'bvn',
  'nin',
  'phone',
  'msisdn',
  'pan',
  'card',
  'cardNumber',
  'cvv',
  'pin',
  'otp',
]);

/** Replace sensitive fields on an object with a fixed-width mask. */
function mask(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(mask);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = PII_FIELDS.has(k) ? '***' : mask(v);
    }
    return out;
  }
  return value;
}

export const logger = {
  info(event: string, payload?: Record<string, unknown>) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[info] ${event}`, mask(payload ?? {}));
    }
  },
  warn(event: string, payload?: Record<string, unknown>) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[warn] ${event}`, mask(payload ?? {}));
    }
  },
  error(event: string, err: unknown, payload?: Record<string, unknown>) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error(`[error] ${event}`, err, mask(payload ?? {}));
    }
  },
};
