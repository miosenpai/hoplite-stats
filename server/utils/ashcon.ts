type UserResponse = {
  uuid: string
  username: string
  demo?: true
}

async function usernameToUuid(username: string) {
  const res = await $fetch.raw<UserResponse>(`https://api.ashcon.app/mojang/v2/user/${username}`, {
    ignoreResponseError: true,
  })
  if (res.status === 200) {
    // compatibility with mojang UUIDs
    res._data!.uuid = res._data!.uuid.replaceAll('-', '')
  }
  return res
}

export function useAshconApi() {
  return {
    usernameToUuid,
  }
}
