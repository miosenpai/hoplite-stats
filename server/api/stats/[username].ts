export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')!

  const mojangApi = useMojangApi()

  const uuidRes = await mojangApi.usernameToUuid(username)

  if (uuidRes.demo)
    throw createError({
      statusCode: 404,
      statusMessage: 'This user does not own Minecraft.',
    })

  return uuidRes
})
