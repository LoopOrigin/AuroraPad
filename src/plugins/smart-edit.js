/**
 * Smart Edit plugin
 * Adds line operations similar to (and beyond) Notepad++:
 * - Duplicate line/selection
 * - Move line/selection up/down
 * - Toggle line comment
 */
export default {
  id: 'smart-edit',
  name: 'Smart Edit',
  version: '1.0.0',
  description: 'Duplicate/move lines and toggle comments using Monaco built-in actions',
  menuItems: [
    {
      id: 'duplicate-down',
      label: 'Duplicate Line / Selection Down',
      run(api) {
        const editor = api.getEditor()
        if (!editor) return
        editor.trigger('smart-edit', 'editor.action.copyLinesDownAction')
      },
    },
    {
      id: 'duplicate-up',
      label: 'Duplicate Line / Selection Up',
      run(api) {
        const editor = api.getEditor()
        if (!editor) return
        editor.trigger('smart-edit', 'editor.action.copyLinesUpAction')
      },
    },
    {
      id: 'move-up',
      label: 'Move Line / Selection Up',
      run(api) {
        const editor = api.getEditor()
        if (!editor) return
        editor.trigger('smart-edit', 'editor.action.moveLinesUpAction')
      },
    },
    {
      id: 'move-down',
      label: 'Move Line / Selection Down',
      run(api) {
        const editor = api.getEditor()
        if (!editor) return
        editor.trigger('smart-edit', 'editor.action.moveLinesDownAction')
      },
    },
    {
      id: 'toggle-comment',
      label: 'Toggle Line Comment',
      run(api) {
        const editor = api.getEditor()
        if (!editor) return
        editor.trigger('smart-edit', 'editor.action.commentLine')
      },
    },
  ],
}

