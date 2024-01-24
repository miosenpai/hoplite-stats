import defaultTheme from 'tailwindcss/defaultTheme'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  devServer: {
    host: '127.0.0.1',
  },
  runtimeConfig: {
    bot: {
      idleMinutes: 10,
      serverHost: '',
      authName: '',
    },
    redisHost: '',
    sseSecret: '',
  },
  // @ts-ignore
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    // 'nuxt-og-image',
  ],
  css: [
    '@fontsource-variable/dm-sans',
  ],
  ui: {
    // causes build OOM error, switched to dynamic for now
    // icons: ['mdi'],
  },
  tailwindcss: {
    viewer: false,
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"DM Sans Variable"', ...defaultTheme.fontFamily.sans],
          },
        },
      },
    },
  },
  nitro: {
    experimental: {
      // https://nitro.unjs.io/guide/utils#experimental-composition-api
      asyncContext: true,
    },
  },
  typescript: {
    typeCheck: 'build',
  },
  colorMode: {
    preference: 'dark',
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  /* ogImage: {
    // future: figure out the correct settings for this
    runtimeCacheStorage: false,
    compatibility: {
      // do not install chromium for CI: https://nuxtseo.com/og-image/guides/chromium#prerenderer-ci-chromium
      prerender: {
        chromium: false,
      },
    },
  }, */
  build: {
    // these packages have CJS compat issues
    transpile: [
      'mineflayer-pathfinder',
      'prismarine-block',
    ],
  },
})
