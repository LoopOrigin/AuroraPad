<template>
  <LegalPage :page="page" :download-url="downloadUrl" />
</template>

<script setup lang="ts">
import LegalPage from '../LegalPage.vue'
import { legalPages, downloadUrl } from '../data/site'

const page = legalPages.license

useSeoMeta({
  title: `AuroraPad | ${page.title}`,
  description: page.summary,
})
</script>
