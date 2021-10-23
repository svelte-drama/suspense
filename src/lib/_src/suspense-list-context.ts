import { getContext as get, setContext as set, onDestroy } from 'svelte'
import { Readable, readable } from 'svelte/store'
import * as STATUS from './suspense-list-status'

const key = {}

type STATUS_VALUES = typeof STATUS[keyof typeof STATUS]
type SuspenseListContext = {
  status: Readable<STATUS_VALUES>
  update: (loaded: boolean) => void
}

const mock: SuspenseListContext = {
  status: readable(STATUS.READY),
  update: () => undefined
}
export function getContext() {
  const register = get<() => SuspenseListContext>(key)
  if (register) {
    const list = register()
    onDestroy(() => list.update(true))
    return list
  } else {
    return mock
  }
}

export function setContext(value?: () => SuspenseListContext) {
  set(key, value)
}
