export type UsernameToUuidRes = {
  id: string
  name: string
  legacy?: true
  demo?: true
}

function usernameToUuid(username: string) {
  return $fetch<UsernameToUuidRes>(`https://api.mojang.com/users/profiles/minecraft/${username}`)
}

export function useMojangApi() {
  return {
    usernameToUuid,
  }
}
