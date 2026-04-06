<template>
  <LegalPage :page="page" :repo-url="repoUrl" :download-url="downloadUrl" />
</template>

<script setup lang="ts">
import LegalPage from '../LegalPage.vue'
import { legalPages, repoUrl, downloadUrl } from '../data/site'

const page = legalPages.terms

useSeoMeta({
  title: `AuroraPad | ${page.title}`,
  description: page.summary,
})
</script>
