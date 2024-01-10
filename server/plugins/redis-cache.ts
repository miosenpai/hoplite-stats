import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(async () => {
  const storage = useStorage()

  const runtimeCfg = useRuntimeConfig()

  const cacheDriver = redisDriver({
    url: runtimeCfg.redisHost,
  })

  // workaround for https://nitro.unjs.io/guide/storage#runtime-configuration
  await storage.unmount('cache')
  storage.mount('cache', cacheDriver)
})
