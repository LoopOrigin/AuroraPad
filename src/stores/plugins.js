import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { getBuiltInPlugins, getMenuStructure } from '../plugins/index'

export const usePluginsStore = defineStore('plugins', () => {
  const plugins = ref([])

  function registerPlugin(plugin) {
    if (!plugin?.id || !plugin?.menuItems?.length) return
    if (plugins.value.some(p => p.id === plugin.id)) return
    plugins.value.push(plugin)
  }

  function loadBuiltInPlugins() {
    for (const plugin of getBuiltInPlugins()) {
      registerPlugin(plugin)
    }
  }

  async function loadUserPlugins() {
    if (!window.electronAPI?.listUserPlugins || !window.electronAPI?.readUserPlugin) return
    const names = await window.electronAPI.listUserPlugins()
    for (const name of names) {
      try {
        const content = await window.electronAPI.readUserPlugin(name)
        if (!content) continue
        const module = { exports: {} }
        const exports = module.exports
        new Function('module', 'exports', content)(module, exports)
        const plugin = module.exports
        if (plugin && plugin.id && Array.isArray(plugin.menuItems)) {
          registerPlugin(plugin)
        }
      } catch (e) {
        console.warn('Plugin load failed:', name, e)
      }
    }
  }

  function getMenuStructureForMain() {
    return getMenuStructure(plugins.value)
  }

  function runAction(pluginId, actionId, api) {
    const plugin = plugins.value.find(p => p.id === pluginId)
    if (!plugin) return
    const action = plugin.menuItems?.find(m => m.id === actionId)
    if (!action?.run) return
    try {
      action.run(api)
    } catch (e) {
      console.error(`Plugin ${plugin.name} action ${actionId}:`, e)
    }
  }

  return {
    plugins,
    registerPlugin,
    loadBuiltInPlugins,
    loadUserPlugins,
    getMenuStructureForMain,
    runAction,
  }
})
