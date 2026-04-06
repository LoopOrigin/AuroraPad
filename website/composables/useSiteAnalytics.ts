type AnalyticsParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const CONSENT_STORAGE_KEY = 'aurorapad-consent-v1'

function hasTrackingConsent() {
  if (!import.meta.client) {
    return false
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) {
      return false
    }

    const parsed = JSON.parse(raw) as { analytics?: boolean }
    return Boolean(parsed.analytics)
  } catch {
    return false
  }
}

function pushEvent(command: 'event' | 'config' | 'set', name: string, params?: AnalyticsParams) {
  if (!import.meta.client || !hasTrackingConsent() || typeof window.gtag !== 'function') {
    return
  }

  window.gtag(command, name, params || {})
}

export function useSiteAnalytics() {
  const trackEvent = (name: string, params?: AnalyticsParams) => {
    pushEvent('event', name, params)
  }

  const trackPageView = (path: string, title?: string) => {
    pushEvent('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: import.meta.client ? window.location.href : path,
    })
  }

  const trackOutboundLink = (label: string, destination: string, placement?: string) => {
    trackEvent('select_content', {
      content_type: 'outbound_link',
      item_id: label,
      destination,
      placement,
    })
  }

  const trackNavigation = (label: string, target: string, placement?: string) => {
    trackEvent('navigation_click', {
      item_id: label,
      target,
      placement,
    })
  }

  return {
    hasTrackingConsent,
    trackEvent,
    trackNavigation,
    trackOutboundLink,
    trackPageView,
  }
}
