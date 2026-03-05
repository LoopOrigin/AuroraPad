/**
 * Whitespace Tools plugin
 * Advanced whitespace operations that go beyond Notepad++:
 * - Trim trailing whitespace
 * - Trim leading + trailing whitespace on each line
 * - Compress multiple blank lines
 * - Convert tabs to spaces
 * - Convert spaces to tabs (simple 4-space heuristic)
 */
function applyToSelectionOrDocument(api, transform) {
  const { text, range } = api.getSelection()
  if (text && range) {
    const next = transform(text)
    api.replaceSelection(next)
  } else {
    const content = api.getContent()
    api.setContent(transform(content))
  }
}

export default {
  id: 'whitespace-tools',
  name: 'Whitespace Tools',
  version: '1.0.0',
  description: 'Trim trailing spaces, normalize blank lines, and convert tabs/spaces',
  menuItems: [
    {
      id: 'trim-trailing',
      label: 'Trim Trailing Whitespace',
      run(api) {
        applyToSelectionOrDocument(api, (input) =>
          input
            .split(/\r\n|\r|\n/)
            .map((line) => line.replace(/\s+$/u, ''))
            .join('\n'),
        )
      },
    },
    {
      id: 'trim-both',
      label: 'Trim Leading && Trailing Whitespace',
      run(api) {
        applyToSelectionOrDocument(api, (input) =>
          input
            .split(/\r\n|\r|\n/)
            .map((line) => line.replace(/^\s+|\s+$/gu, ''))
            .join('\n'),
        )
      },
    },
    {
      id: 'compress-blank-lines',
      label: 'Compress Multiple Blank Lines',
      run(api) {
        applyToSelectionOrDocument(api, (input) => {
          const lines = input.split(/\r\n|\r|\n/)
          const out = []
          let blankStreak = 0
          for (const line of lines) {
            if (line.trim() === '') {
              blankStreak += 1
              if (blankStreak === 1) out.push('')
            } else {
              blankStreak = 0
              out.push(line)
            }
          }
          return out.join('\n')
        })
      },
    },
    {
      id: 'tabs-to-spaces',
      label: 'Convert Tabs to Spaces (4)',
      run(api) {
        applyToSelectionOrDocument(api, (input) => input.replace(/\t/g, '    '))
      },
    },
    {
      id: 'spaces-to-tabs',
      label: 'Convert Spaces to Tabs (4)',
      run(api) {
        applyToSelectionOrDocument(api, (input) =>
          input
            .split(/\r\n|\r|\n/)
            .map((line) => line.replace(/ {4}/g, '\t'))
            .join('\n'),
        )
      },
    },
  ],
}

