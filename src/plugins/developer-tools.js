function applyToSelectionOrDocument(api, transform) {
  const { text, range } = api.getSelection()
  const hasSelection = typeof text === 'string' && text.length > 0 && range
  const source = hasSelection ? text : api.getContent()
  const next = transform(source)

  if (hasSelection) {
    api.replaceSelection(next)
  } else {
    api.setContent(next)
  }
}

function withErrorBoundary(label, fn) {
  try {
    fn()
  } catch (error) {
    alert(`${label} failed.\n\n${error.message || error}`)
  }
}

export default {
  id: 'developer-tools',
  name: 'Developer Tools',
  version: '1.0.0',
  description: 'JSON formatting and common encoding helpers for day-to-day editing',
  menuItems: [
    {
      id: 'json-pretty-print',
      label: 'JSON: Pretty Print',
      run(api) {
        withErrorBoundary('JSON formatting', () => {
          applyToSelectionOrDocument(api, (input) => JSON.stringify(JSON.parse(input), null, 2))
        })
      },
    },
    {
      id: 'json-minify',
      label: 'JSON: Minify',
      run(api) {
        withErrorBoundary('JSON minify', () => {
          applyToSelectionOrDocument(api, (input) => JSON.stringify(JSON.parse(input)))
        })
      },
    },
    {
      id: 'url-encode',
      label: 'Selection: URL Encode',
      run(api) {
        withErrorBoundary('URL encode', () => {
          applyToSelectionOrDocument(api, (input) => encodeURIComponent(input))
        })
      },
    },
    {
      id: 'url-decode',
      label: 'Selection: URL Decode',
      run(api) {
        withErrorBoundary('URL decode', () => {
          applyToSelectionOrDocument(api, (input) => decodeURIComponent(input))
        })
      },
    },
    {
      id: 'base64-encode',
      label: 'Selection: Base64 Encode',
      run(api) {
        withErrorBoundary('Base64 encode', () => {
          applyToSelectionOrDocument(api, (input) => btoa(unescape(encodeURIComponent(input))))
        })
      },
    },
    {
      id: 'base64-decode',
      label: 'Selection: Base64 Decode',
      run(api) {
        withErrorBoundary('Base64 decode', () => {
          applyToSelectionOrDocument(api, (input) => decodeURIComponent(escape(atob(input))))
        })
      },
    },
  ],
}
