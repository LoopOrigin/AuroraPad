<template>
  <div class="terminal-panel">
    <div v-if="showHeader" class="terminal-header">
      <span>{{ title }}</span>
      <button type="button" @click="$emit('close')">✕</button>
    </div>
    <div ref="containerRef" class="terminal-body"></div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

const props = defineProps({
  shell: { type: String, default: 'default' },
  cwd: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  title: { type: String, default: 'Terminal' },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'status-change'])

const containerRef = ref(null)
let xterm = null
let fitAddon = null
let terminalId = null
let resizeObserver = null

function setStatus(status) {
  emit('status-change', status)
}

function resolveTerminalTheme() {
  const styles = getComputedStyle(document.documentElement)
  return {
    background: styles.getPropertyValue('--npp-bg').trim() || '#1e1e1e',
    foreground: styles.getPropertyValue('--npp-text').trim() || '#d4d4d4',
    cursor: styles.getPropertyValue('--npp-accent').trim() || '#4fc3f7',
    selectionBackground: 'rgba(79, 195, 247, 0.22)',
  }
}

function handleData({ id, data }) {
  if (id !== terminalId || !xterm) return
  xterm.write(data)
}

function handleExit({ id }) {
  if (id !== terminalId || !xterm) return
  setStatus('exited')
  xterm.write('\r\n\u001b[31m[Process exited]\u001b[0m\r\n')
}

async function createBackend(cols, rows) {
  if (!window.electronAPI?.createTerminal) {
    setStatus('error')
    return
  }

  setStatus('starting')
  const result = await window.electronAPI.createTerminal({
    shell: props.shell,
    cwd: props.cwd || undefined,
    cols,
    rows,
  })

  if (result?.error) {
    setStatus('error')
    xterm.write(`\r\n\u001b[31mERROR: ${result.error}\u001b[0m\r\n`)
    return
  }

  terminalId = result.id
  setStatus('ready')
}

function onResize() {
  if (!fitAddon || !xterm || !terminalId || !window.electronAPI?.resizeTerminal) return
  fitAddon.fit()
  window.electronAPI.resizeTerminal({
    id: terminalId,
    cols: xterm.cols,
    rows: xterm.rows,
  })
}

function clearTerminal() {
  xterm?.clear()
}

function focusTerminal() {
  xterm?.focus()
}

onMounted(async () => {
  if (!containerRef.value) return

  xterm = new Terminal({
    cols: 80,
    rows: 24,
    fontSize: 13,
    convertEol: true,
    cursorBlink: true,
    theme: resolveTerminalTheme(),
  })
  fitAddon = new FitAddon()
  xterm.loadAddon(fitAddon)
  xterm.open(containerRef.value)
  fitAddon.fit()
  xterm.focus()

  await createBackend(xterm.cols, xterm.rows)

  xterm.onData(data => {
    if (terminalId && window.electronAPI?.writeTerminal) {
      window.electronAPI.writeTerminal({ id: terminalId, data })
    }
  })

  window.electronAPI?.onTerminalData(handleData)
  window.electronAPI?.onTerminalExit(handleExit)

  resizeObserver = new ResizeObserver(() => onResize())
  resizeObserver.observe(containerRef.value)
  window.addEventListener('resize', onResize)
})

watch(() => props.active, (value) => {
  if (value) {
    nextTick(() => {
      onResize()
      focusTerminal()
    })
  }
})

onBeforeUnmount(() => {
  if (terminalId && window.electronAPI?.disposeTerminal) {
    window.electronAPI.disposeTerminal({ id: terminalId })
  }
  resizeObserver?.disconnect()
  window.removeEventListener('resize', onResize)
  xterm?.dispose()
  xterm = null
  fitAddon = null
})

defineExpose({
  clearTerminal,
  focusTerminal,
})
</script>

<style scoped>
.terminal-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: 0;
  background: transparent;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  border-bottom: 1px solid var(--npp-tab-border);
}

.terminal-body {
  flex: 1;
  min-height: 0;
  padding: 0 8px 8px;
}
</style>
