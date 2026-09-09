import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'Pixel — Image Extractor',
  description:
    'A high-performance Chrome extension for extracting, analyzing, and managing images from any webpage.',
  version: pkg.version,
  icons: {
    16: 'public/icons/icon16.png',
    32: 'public/icons/icon32.png',
    48: 'public/icons/icon48.png',
    128: 'public/icons/icon128.png',
  },
  permissions: ['sidePanel', 'activeTab', 'scripting', 'contextMenus', 'downloads'],
  host_permissions: ['<all_urls>'],
  action: {
    default_title: 'Pixel — Image Extractor',
  },
  background: {
    service_worker: 'src/background.ts',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/main.tsx'],
    },
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
