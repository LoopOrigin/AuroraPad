<template>
  <div class="terminal-panel">
    <div v-if="showHeader" class="terminal-header">
      <span>Terminal</span>
      <button type="button" @click="$emit('close')">✕</button>
    </div>
    <div class="terminal-body">
      <pre class="terminal-output">{{ output }}</pre>
    </div>
    <form class="terminal-input-row" @submit.prevent="run">
      <input
        ref="inputRef"
        v-model="command"
        type="text"
        placeholder="Type a command and press Enter..."
        autocomplete="off"
      />
      <button type="submit">Run</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  initialCommand: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

const command = ref(props.initialCommand)
const output = ref('')
const inputRef = ref(null)

onMounted(() => {
  inputRef.value?.focus()
})

async function run() {
  if (!command.value) return
  const cmd = command.value
  output.value += `> ${cmd}\n`
  if (!window.electronAPI?.runCommand) {
    output.value += 'ERROR: Integrated runCommand API is not available.\n'
    return
  }
  try {
    const result = await window.electronAPI.runCommand(cmd)
    if (result?.error) {
      output.value += `ERROR: ${result.error}\n`
    }
    if (result?.stdout) {
      output.value += result.stdout + (result.stdout.endsWith('\n') ? '' : '\n')
    }
    if (result?.stderr) {
      output.value += result.stderr + (result.stderr.endsWith('\n') ? '' : '\n')
    }
  } catch (e) {
    output.value += `ERROR: ${e?.message || String(e)}\n`
  }
}
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
  overflow: auto;
  padding: 4px 8px;
}

.terminal-output {
  white-space: pre-wrap;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  margin: 0;
}

.terminal-input-row {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
  border-top: 1px solid var(--npp-tab-border);
}

.terminal-input-row input {
  flex: 1;
  font-family: inherit;
  font-size: 12px;
}

.terminal-input-row button {
  padding: 2px 10px;
  font-size: 12px;
}
</style>

