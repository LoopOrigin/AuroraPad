/**
 * Sort Lines - Notepad++ compatible plugin
 * Sorts selected lines or entire document.
 */
export default {
  id: 'sort-lines',
  name: 'Sort Lines',
  version: '1.0.0',
  description: 'Sort lines alphabetically',
  menuItems: [
    {
      id: 'asc',
      label: 'Sort Lines Ascending',
      run(api) {
        const { text, range } = api.getSelection()
        const content = api.getContent()
        const lines = (range ? text : content).split(/\r\n|\r|\n/)
        const sorted = lines.slice().sort((a, b) => a.localeCompare(b))
        const result = sorted.join('\n')
        if (range) {
          api.replaceSelection(result)
        } else {
          api.setContent(result)
        }
      },
    },
    {
      id: 'desc',
      label: 'Sort Lines Descending',
      run(api) {
        const { text, range } = api.getSelection()
        const content = api.getContent()
        const lines = (range ? text : content).split(/\r\n|\r|\n/)
        const sorted = lines.slice().sort((a, b) => b.localeCompare(a))
        const result = sorted.join('\n')
        if (range) {
          api.replaceSelection(result)
        } else {
          api.setContent(result)
        }
      },
    },
  ],
}
