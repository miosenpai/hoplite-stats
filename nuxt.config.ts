// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  devServer: {
    host: '127.0.0.1',
  },
  runtimeConfig: {
    bot: {
      idleMinutes: 10,
      serverHost: '127.0.0.1',
      authName: '',
    },
  },
  modules: [
    '@nuxt/ui',
  ],
  tailwindcss: {
    viewer: false,
  },
  nitro: {
    experimental: {
      // https://nitro.unjs.io/guide/utils#experimental-composition-api
      asyncContext: true,
    },
    storage: {},
    devStorage: {
      cache: {
        driver: 'redis',
      },
    },
  },
})
