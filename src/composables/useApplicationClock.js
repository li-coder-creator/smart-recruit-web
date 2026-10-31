import { onBeforeUnmount, ref } from 'vue'
import { APPLICATION_CLOCK_TICK_MS } from '@/constants/application'
import { requireServerTime } from '@/utils/application'

export const useApplicationClock = () => {
  const now = ref(NaN)
  let serverEpoch = NaN,
    receivedAt = 0
  const tick = () => {
    if (Number.isFinite(serverEpoch)) now.value = serverEpoch + performance.now() - receivedAt
  }
  const sync = (data) => {
    serverEpoch = requireServerTime(data)
    receivedAt = performance.now()
    tick()
  }
  const timer = window.setInterval(tick, APPLICATION_CLOCK_TICK_MS)
  onBeforeUnmount(() => window.clearInterval(timer))
  return { now, sync }
}
