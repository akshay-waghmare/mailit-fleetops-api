
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {
  "apps/console-app/src/app/pages/organizations.component.ts": [
    "chunk-5W7WEHRA.js"
  ],
  "apps/console-app/src/app/pages/places.component.ts": [
    "chunk-JZYPWIPZ.js"
  ],
  "apps/console-app/src/app/pages/geofences.component.ts": [
    "chunk-RBCM5TXE.js"
  ],
  "apps/console-app/src/app/pages/orders.component.ts": [
    "chunk-R57J6UWO.js"
  ]
},
  assets: {
    'index.csr.html': {size: 958, hash: 'c5e6136ff448f09878dd75dd393f5d80fda6b9e5cb0446085f4fef25ee5c4d31', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1050, hash: 'da0ae9a7c0854c77b8a7a54ff8ff3f3cb8f4817af21d72a9fe7404ea915d848f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-NTWFIE2G.css': {size: 66719, hash: '3L5HS9vj0U4', text: () => import('./assets-chunks/styles-NTWFIE2G_css.mjs').then(m => m.default)}
  },
};
