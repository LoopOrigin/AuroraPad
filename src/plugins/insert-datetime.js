/**
 * Insert Date/Time - Notepad++ compatible plugin
 * Inserts current date/time at cursor or replaces selection.
 */
export default {
  id: 'insert-datetime',
  name: 'Insert Date/Time',
  version: '1.0.0',
  description: 'Insert current date and/or time at cursor',
  menuItems: [
    {
      id: 'datetime',
      label: 'Insert Date/Time',
      run(api) {
        const now = new Date()
        const str = now.toLocaleString()
        api.replaceSelection(str)
      },
    },
    {
      id: 'date',
      label: 'Insert Date',
      run(api) {
        const str = new Date().toLocaleDateString()
        api.replaceSelection(str)
      },
    },
    {
      id: 'time',
      label: 'Insert Time',
      run(api) {
        const str = new Date().toLocaleTimeString()
        api.replaceSelection(str)
      },
    },
  ],
}
