async function usernameToUuid(username: string): Promise<UsernameToUuidRes> {
  const playerDbRes = await $fetch<{
    data: {
      player: {
        username: string
        raw_id: string
      }
    }
  }>(`https://playerdb.co/api/player/minecraft/${username}`, {
    onResponseError: ({ error, response }) => {
      if (response.status >= 500 || response.status < 400)
        console.log(error)
    },
  })

  // compatible interface with mojang API (if we return to using it in the future)
  return {
    name: playerDbRes.data.player.username,
    id: playerDbRes.data.player.raw_id,
  }
}

export function usePlayerDb() {
  return {
    usernameToUuid,
  }
}
