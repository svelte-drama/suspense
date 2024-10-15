import { getContext as get, setContext as set } from 'svelte'
import { readable, type Readable } from 'svelte/store'
import { STATUS } from './status.js'

const key = {}

export type SuspenseListContext = {
  status: STATUS
}
export type RegisterFunction = (data: {
  element: HTMLElement | undefined
  loaded: boolean
}) => SuspenseListContext

const mock: RegisterFunction = () => ({ status: STATUS.READY })
export function getSuspenseListContext() {
  const register = get<RegisterFunction | undefined>(key)
  return register || mock
}

export function setSuspenseListContext(value?: RegisterFunction) {
  set(key, value)
}
