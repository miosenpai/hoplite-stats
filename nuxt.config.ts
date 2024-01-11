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
      profilesDir: '',
    },
    redisHost: '',
  },
  modules: [
    '@nuxt/ui',
  ],
  css: [
    '@fontsource-variable/dm-sans',
  ],
  ui: {
    // 'all' doesn't work on latest stable, it works on edge
    icons: ['mdi'],
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
})
