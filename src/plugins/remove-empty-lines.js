/**
 * Remove Empty Lines - Notepad++ compatible plugin
 */
export default {
  id: 'remove-empty-lines',
  name: 'Remove Empty Lines',
  version: '1.0.0',
  description: 'Remove empty lines from selection or document',
  menuItems: [
    {
      id: 'remove',
      label: 'Remove Empty Lines',
      run(api) {
        const { text, range } = api.getSelection()
        const content = api.getContent()
        const input = range ? text : content
        const lines = input.split(/\r\n|\r|\n/)
        const result = lines.filter(line => line.trim() !== '').join('\n')
        if (range) {
          api.replaceSelection(result)
        } else {
          api.setContent(result)
        }
      },
    },
  ],
}
