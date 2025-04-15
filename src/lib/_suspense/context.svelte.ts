import { getContext, onDestroy, setContext as set } from 'svelte'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

interface SWRModel<T> {
  current: T | undefined
  error?: Error | undefined
}

export type InternalSuspend = {
  promise<T>(data: Promise<T>): () => void
  rune<T>(data: SWRModel<T>): () => void
}
export type Suspend = <T extends SWRModel<any> | Promise<any>>(data: T) => T

const mock = <T>(data: T) => {
  return data
}

export function createSuspense(): Suspend {
  const interal_suspend = getContext<InternalSuspend>(key)
  if (!interal_suspend) {
    console.warn('`createSuspense` called outside of a Suspense boundary')
    return mock
  }

  const subscriptions: (() => void)[] = []
  onDestroy(() => {
    for (const unsub of subscriptions) {
      unsub()
    }
  })

  function effectRunner(fn: () => () => void) {
    if ($effect.tracking()) {
      $effect(fn)
    } else {
      const destroy = $effect.root(fn)
      subscriptions.push(destroy)
    }
  }

  function suspend<T extends SWRModel<any> | Promise<any>>(data: T): T {
    effectRunner(() => {
      if ('current' in data) {
        return interal_suspend.rune(data)
      } else {
        return interal_suspend.promise(data)
      }
    })
    return data
  }
  return suspend
}

export function setContext(value: InternalSuspend) {
  set(key, value)
}

export function suspend<T extends SWRModel<any> | Promise<any>>(data: T): T {
  const interal_suspend = getContext<InternalSuspend | undefined>(key)
  if (!interal_suspend) {
    console.warn('`suspend` called outside of a Suspense boundary')
    return data
  }

  $effect(() => {
    if ('current' in data) {
      return interal_suspend.rune(data)
    } else {
      return interal_suspend.promise(data)
    }
  })
  return data
}
