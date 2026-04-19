/**
 * Analytics stub.
 *
 * Screens call `track(event, props)` at key conversion points. In MVP this is
 * a no-op so we don't ship without a provider. When Segment / Mixpanel is
 * picked, replace this file's body with the real client — call sites stay.
 */

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export function track(_event: string, _props?: AnalyticsProps): void {
  // Intentional no-op. Keep the signature stable.
}

export function identify(_userId: string, _traits?: AnalyticsProps): void {
  // Intentional no-op.
}
