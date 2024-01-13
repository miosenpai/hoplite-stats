/*

Prod environment doesn't have persistent disk storage, so we implement the interface from
https://github.com/PrismarineJS/prismarine-auth/blob/66610bab137a1f3899c48867152ec49575367bf6/src/common/cache/FileCache.js#L4
with Redis as the backing storage.

*/

export function createAuthCache({ cacheName, username }: { cacheName: string, username: string }) {
  const authCache = {
    cacheKey: `bot-session:${username}:${cacheName}`,
    cacheStore: useStorage('cache'),
    cached: null as any,
    async loadInitialValue() {
      const fromStore = await this.cacheStore.getItem(this.cacheKey)
      if (fromStore)
        return fromStore

      await this.cacheStore.setItem(this.cacheKey, {})
      return {}
    },
    async getCached() {
      if (!this.cached)
        this.cached = await this.loadInitialValue()
      return this.cached
    },
    async setCached(cached: any) {
      this.cached = cached
      await this.cacheStore.setItem(this.cacheKey, this.cached)
    },
    async setCachedPartial(cached: any) {
      await this.setCached({
        ...this.cached,
        ...cached,
      })
    },
  }
  return authCache
}
