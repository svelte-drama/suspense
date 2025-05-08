import { getContext, setContext as set } from 'svelte'

const key = Symbol()

export type Suspend = <T>(data: T) => T

export function setContext(value: Suspend) {
  set(key, value)
}

export function suspend<T>(data: T): T {
  const interal_suspend = getContext<Suspend | undefined>(key)
  if (!interal_suspend) {
    console.error('`suspend` called outside of a Suspense boundary')
    return data
  }

  return interal_suspend(data)
}
