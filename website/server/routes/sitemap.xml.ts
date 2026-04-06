function normalizeBaseUrl(input: string) {
  return input.replace(/\/+$/, '')
}

function toAbsoluteUrl(baseUrl: string, path: string) {
  return path === '/' ? baseUrl : `${baseUrl}${path}`
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = normalizeBaseUrl(config.public.siteUrl || 'https://example.com')
  const lastmod = '2026-04-06'

  const routes = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/terms', changefreq: 'yearly', priority: '0.3' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { path: '/usage', changefreq: 'yearly', priority: '0.3' },
    { path: '/license', changefreq: 'yearly', priority: '0.3' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${toAbsoluteUrl(baseUrl, route.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
