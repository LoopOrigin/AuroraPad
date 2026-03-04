/**
 * Plugin registry - loads built-in plugins and Notepad++-style plugins from user folder.
 * Plugins export: { id, name, version?, description?, menuItems: [{ id, label, run(api) }] }
 */
import insertDatetime from './insert-datetime.js'
import sortLines from './sort-lines.js'
import removeEmptyLines from './remove-empty-lines.js'

const builtInPlugins = [insertDatetime, sortLines, removeEmptyLines]

export function getBuiltInPlugins() {
  return builtInPlugins
}

export function getMenuStructure(plugins) {
  const items = []
  for (const plugin of plugins) {
    for (const menuItem of plugin.menuItems || []) {
      items.push({
        pluginId: plugin.id,
        pluginName: plugin.name,
        actionId: menuItem.id,
        label: menuItem.label,
      })
    }
  }
  return items
}
