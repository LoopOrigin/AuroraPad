function normalizeBaseUrl(input: string) {
  return input.replace(/\/+$/, '')
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = normalizeBaseUrl(config.public.siteUrl || 'https://example.com')

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join('\n')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return body
})
