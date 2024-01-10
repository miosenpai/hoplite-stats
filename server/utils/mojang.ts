type UsernameToUuidRes = {
  id: string
  name: string
  legacy?: true
  demo?: true
}

function usernameToUuid(username: string) {
  return $fetch.raw<UsernameToUuidRes>(`https://api.mojang.com/users/profiles/minecraft/${username}`, {
    ignoreResponseError: true,
  })
}

export function useMojangApi() {
  return {
    usernameToUuid,
  }
}
