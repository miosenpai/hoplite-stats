export function isInternalReq() {
  const event = useEvent()

  const runtimeCfg = useRuntimeConfig()

  const incomingReqKey = getRequestHeader(event, 'Internal-Req-Key')

  return incomingReqKey === runtimeCfg.internalReqKey
}
