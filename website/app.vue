<template>
  <div>
    <NuxtPage />
    <ConsentBanner />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { trackPageView } = useSiteAnalytics()

if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => {
      trackPageView(route.fullPath, document.title)
    },
    { immediate: true }
  )
}
</script>
