import { getContext as get, setContext as set, onDestroy } from 'svelte'
import { readable } from 'svelte/store'
import * as STATUS from './status'
import type { Readable } from 'svelte/store'

const key = {}

type STATUS_VALUES = typeof STATUS[keyof typeof STATUS]
type SuspenseListContext = {
  status: Readable<STATUS_VALUES>
  update: (loaded: boolean) => void
}

const mock: SuspenseListContext = {
  status: readable(STATUS.READY),
  update: () => undefined,
}
export function getContext() {
  const register = get<() => SuspenseListContext | undefined>(key)
  const list = register?.() || mock
  onDestroy(() => list.update(true))
  return list
}

export function setContext(value?: () => SuspenseListContext) {
  set(key, value)
}
