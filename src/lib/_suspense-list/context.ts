import { getContext as get, setContext as set } from 'svelte'
import { readable, type Readable } from 'svelte/store'
import { STATUS } from './status.js'

const key = {}

export type SuspenseListContext = Readable<STATUS>
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
