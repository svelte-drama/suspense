import { getContext as get, setContext as set } from 'svelte'
import { readable } from 'svelte/store'
import * as STATUS from './status.js'
import type { Readable } from 'svelte/store'
import type { STATUS_VALUES } from './status.js'

const key = {}

type SuspenseListContext = Readable<STATUS_VALUES>
type RegisterFunction = (
  element: HTMLElement,
  loaded: Readable<boolean>
) => SuspenseListContext

const mock: RegisterFunction = () => readable(STATUS.READY)
export function getContext() {
  const register = get<RegisterFunction | undefined>(key)
  return register || mock
}

export function setContext(value?: RegisterFunction) {
  set(key, value)
}
