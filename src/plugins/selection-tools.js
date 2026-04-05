function replaceSelectionOrDocument(api, transform) {
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

function wrapWith(left, right = left) {
  return (input) => `${left}${input}${right}`
}

export default {
  id: 'selection-tools',
  name: 'Selection Tools',
  version: '1.0.0',
  description: 'Quick wrap and line transforms for small editing tasks',
  menuItems: [
    {
      id: 'wrap-double-quotes',
      label: 'Wrap Selection in "Double Quotes"',
      run(api) {
        replaceSelectionOrDocument(api, wrapWith('"'))
      },
    },
    {
      id: 'wrap-single-quotes',
      label: "Wrap Selection in 'Single Quotes'",
      run(api) {
        replaceSelectionOrDocument(api, wrapWith("'"))
      },
    },
    {
      id: 'wrap-parentheses',
      label: 'Wrap Selection in Parentheses',
      run(api) {
        replaceSelectionOrDocument(api, wrapWith('(', ')'))
      },
    },
    {
      id: 'reverse-lines',
      label: 'Reverse Selected Lines',
      run(api) {
        replaceSelectionOrDocument(api, (input) => input.split(/\r\n|\r|\n/).reverse().join('\n'))
      },
    },
  ],
}
