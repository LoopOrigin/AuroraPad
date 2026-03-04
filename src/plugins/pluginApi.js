/**
 * Plugin API passed to each plugin's run(api) function.
 * Notepad++-style: plugins can read/edit content, selection, and trigger editor actions.
 */
export function createPluginApi(getEditorRef, getActiveTab, updateTabContent) {
  return {
    getContent() {
      const tab = getActiveTab()
      return tab?.content ?? ''
    },
    setContent(text) {
      const tab = getActiveTab()
      if (tab) updateTabContent(tab.id, text)
    },
    getSelection() {
      const editor = getEditorRef()
      if (!editor) return { text: '', range: null }
      const monaco = editor.getEditor()
      if (!monaco) return { text: '', range: null }
      const selection = monaco.getSelection()
      const model = monaco.getModel()
      if (!model || !selection) return { text: '', range: null }
      const text = model.getValueInRange(selection)
      return { text, range: selection }
    },
    replaceSelection(text) {
      const editor = getEditorRef()
      const monaco = editor?.getEditor()
      if (!monaco) return
      const selection = monaco.getSelection()
      monaco.executeEdits('plugin', [{ range: selection, text }])
    },
    getEditor() {
      return getEditorRef()?.getEditor() ?? null
    },
  }
}
