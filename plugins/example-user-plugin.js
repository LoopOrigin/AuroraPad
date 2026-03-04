/**
 * Example user plugin for Notepad Clone (Notepad++-style).
 * Copy this file to the Plugins Folder (Plugins > Plugin Manager > Open Plugins Folder).
 * Restart the app to load.
 *
 * API: run(api) receives:
 *   api.getContent() - full document text
 *   api.setContent(text) - replace full document
 *   api.getSelection() - { text, range }
 *   api.replaceSelection(text) - replace current selection
 */
module.exports = {
  id: 'example-user-plugin',
  name: 'Example User Plugin',
  version: '1.0.0',
  description: 'Sample plugin you can copy to the plugins folder',
  menuItems: [
    {
      id: 'insert-hello',
      label: 'Insert "Hello from plugin"',
      run(api) {
        api.replaceSelection('Hello from plugin!')
      },
    },
    {
      id: 'uppercase-selection',
      label: 'Uppercase Selection',
      run(api) {
        const { text } = api.getSelection()
        if (text) api.replaceSelection(text.toUpperCase())
      },
    },
  ],
}
