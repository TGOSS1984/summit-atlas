export type FeedbackType = 'bug' | 'feature' | 'improvement'

interface FeedbackTypeInfo {
  chip: string
  name: string
  prefix: string
  label: string
}

export const FEEDBACK_REPO = 'https://github.com/TGOSS1984/summit-atlas'

export const FEEDBACK_TYPES: Record<FeedbackType, FeedbackTypeInfo> = {
  bug: { chip: '🐛 Bug', name: 'Bug report', prefix: '[Bug]', label: 'bug' },
  feature: { chip: '💡 Feature', name: 'Feature request', prefix: '[Feature]', label: 'enhancement' },
  improvement: { chip: '✨ Improvement', name: 'Improvement', prefix: '[Improvement]', label: 'enhancement' },
}

// raw navigator.userAgent reads as noise ("Mozilla/5.0 ... Safari" on
// Chrome, macOS version frozen at 10_15_7 forever), so reports carry a
// plain-English summary instead. Match order matters - Chromium browsers
// all contain "Chrome" and everything contains "Safari", so the more
// specific tokens have to go first
export function describeBrowser(): string {
  const ua = navigator.userAgent
  const os = /iPhone|iPod/.test(ua)
    ? 'iOS'
    : /iPad/.test(ua)
      ? 'iPadOS'
      : /Android/.test(ua)
        ? 'Android'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Macintosh/.test(ua)
            ? 'macOS'
            : /CrOS/.test(ua)
              ? 'ChromeOS'
              : /Linux/.test(ua)
                ? 'Linux'
                : 'an unknown OS'

  const browsers: [string, RegExp][] = [
    ['Edge', /Edg(?:e|iOS|A)?\/(\d+)/],
    ['Opera', /OPR\/(\d+)/],
    ['Samsung Internet', /SamsungBrowser\/(\d+)/],
    ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/],
    ['Chrome', /(?:Chrome|CriOS)\/(\d+)/],
    ['Safari', /Version\/(\d+)[.\d]* .*Safari/],
  ]
  for (const [name, re] of browsers) {
    const match = ua.match(re)
    if (match) return `${name} ${match[1]} on ${os}`
  }
  return `an unrecognized browser on ${os}`
}

interface FeedbackContext {
  view: string
  peaksLogged: number
}

// nothing is sent anywhere until the person presses "Submit new issue" on
// GitHub's own page - this just builds the pre-filled URL
export function buildFeedbackIssueUrl(type: FeedbackType, message: string, context: FeedbackContext): string {
  const info = FEEDBACK_TYPES[type]
  const firstLine = message.split('\n')[0]
  const title = `${info.prefix} ${firstLine.length > 64 ? `${firstLine.slice(0, 64).trimEnd()}…` : firstLine}`

  const body = [
    message,
    '',
    '---',
    '_Filed from the in-app feedback form_',
    `- **Type:** ${info.name}`,
    `- **View:** ${context.view}`,
    `- **Peaks logged:** ${context.peaksLogged}`,
    // "at 2x", not "@2x" - GitHub renders @2x as a user mention
    `- **Screen:** ${window.innerWidth}×${window.innerHeight} at ${window.devicePixelRatio || 1}x`,
    `- **Browser:** ${describeBrowser()}`,
  ].join('\n')

  return (
    `${FEEDBACK_REPO}/issues/new` +
    `?title=${encodeURIComponent(title)}` +
    `&labels=${encodeURIComponent(info.label)}` +
    `&body=${encodeURIComponent(body)}`
  )
}