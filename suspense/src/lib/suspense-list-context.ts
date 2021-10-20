import { getContext as get, setContext as set, onDestroy } from 'svelte'
import { readable } from 'svelte/store'

export const enum STATUS {
  READY = 1,
  LOADING,
  HIDDEN
}

const key = {}


const mock = {
  onFinished () { return },
  isReady: readable(STATUS.READY)
}
export function getContext () {
  const register = get<() => typeof mock>(key)
  if (register) {
    const list = register() as typeof mock
    onDestroy(list.onFinished)
    return list
  } else {
    return mock
  }
}


export function setContext (value?: unknown) {
  set(key, value)
}
