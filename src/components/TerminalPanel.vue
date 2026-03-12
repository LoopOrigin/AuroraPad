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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

const props = defineProps({
  shell: { type: String, default: 'default' },
  cwd: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  title: { type: String, default: 'Terminal' },
})

const emit = defineEmits(['close'])

const containerRef = ref(null)
let xterm = null
let fitAddon = null
let terminalId = null

function handleData({ id, data }) {
  if (id !== terminalId || !xterm) return
  xterm.write(data)
}

function handleExit({ id }) {
  if (id !== terminalId || !xterm) return
  xterm.write('\r\n\u001b[31m[Process exited]\u001b[0m\r\n')
}

async function createBackend(cols, rows) {
  if (!window.electronAPI?.createTerminal) return
  const result = await window.electronAPI.createTerminal({
    shell: props.shell,
    cwd: props.cwd || undefined,
    cols,
    rows,
  })
  if (result?.error) {
    xterm.write(`\r\n\u001b[31mERROR: ${result.error}\u001b[0m\r\n`)
    return
  }
  terminalId = result.id
}

onMounted(async () => {
  if (!containerRef.value) return
  xterm = new Terminal({
    cols: 80,
    rows: 24,
    fontSize: 13,
    convertEol: true,
    cursorBlink: true,
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

  window.addEventListener('resize', onResize)
})

function onResize() {
  if (!fitAddon || !xterm || !terminalId || !window.electronAPI?.resizeTerminal) return
  fitAddon.fit()
  window.electronAPI.resizeTerminal({
    id: terminalId,
    cols: xterm.cols,
    rows: xterm.rows,
  })
}

onBeforeUnmount(() => {
  if (terminalId && window.electronAPI?.disposeTerminal) {
    window.electronAPI.disposeTerminal({ id: terminalId })
  }
  window.removeEventListener('resize', onResize)
  xterm?.dispose()
  xterm = null
  fitAddon = null
})
</script>

<style scoped>
.terminal-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 200px;
  border-top: 1px solid var(--npp-tab-border);
  background: var(--npp-bg);
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
}
</style>

