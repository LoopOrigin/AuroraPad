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

function toTitleCase(input) {
  return input.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function toSlug(input) {
  return input
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default {
  id: 'text-tools',
  name: 'Text Tools',
  version: '1.0.0',
  description: 'Small writing and cleanup helpers for content editing',
  menuItems: [
    {
      id: 'title-case',
      label: 'Convert to Title Case',
      run(api) {
        applyToSelectionOrDocument(api, toTitleCase)
      },
    },
    {
      id: 'slugify',
      label: 'Slugify Selection / Document',
      run(api) {
        applyToSelectionOrDocument(api, toSlug)
      },
    },
    {
      id: 'selection-stats',
      label: 'Selection Statistics',
      run(api) {
        const { text } = api.getSelection()
        const source = text || api.getContent()
        const characters = source.length
        const words = (source.trim().match(/\S+/g) || []).length
        const lines = source.length ? source.split(/\r\n|\r|\n/).length : 0
        alert(`Selection statistics\n\nCharacters: ${characters}\nWords: ${words}\nLines: ${lines}`)
      },
    },
  ],
}
