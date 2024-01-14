export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  if (pathname.startsWith('/api/stats/')) {
    const mojangApi = useMojangApi()
    // can't use getRouterParam here due to upstream bug: https://github.com/unjs/nitro/issues/715
    const uuidRes = await mojangApi.usernameToUuid(pathname.split('/')[3])
    event.context.uuidObj = uuidRes
  }
})
