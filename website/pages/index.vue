<template>
  <WebsiteApp />
</template>

<script setup>
import WebsiteApp from '../WebsiteApp.vue'

useSeoMeta({
  title: 'AuroraPad | Fast Desktop Editor for Focused Project Work',
  description:
    'AuroraPad is a modern cross-platform desktop editor with Monaco, workspace search, command palette workflows, plugin skills, semantic releases, and integrated terminal sessions.',
  ogTitle: 'AuroraPad | Fast Desktop Editor for Focused Project Work',
  ogDescription:
    'A modern desktop editor for Windows, macOS, and Linux with workspace search, integrated terminal workflows, and CI-managed releases.',
  ogType: 'website',
})
</script>
