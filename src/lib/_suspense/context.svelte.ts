import { getContext, onDestroy, setContext as set } from 'svelte'
import type { Readable } from 'svelte/store'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

export type InternalSuspend = {
  promise<T>(data: Promise<T>): () => void
  store<T>(data: Readable<T>, error?: Readable<Error | undefined>): () => void
}
type BaseSuspend = {
  <T>(data: Promise<T>): Promise<T>
  <T>(data: Readable<T>, error?: Readable<Error | undefined>): Readable<T>
}
export type Suspend = {
  <T>(data: Promise<T>): Promise<T>
  <T>(data: Readable<T>, error?: Readable<Error | undefined>): Readable<T>
  all<T extends unknown[]>(
    ...data: T
  ): Promise<{
    [P in keyof T]: Awaited<T[P]>
  }>
}

const mock = addUtilityFunctions(<T>(data: T) => {
  return data
})

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
      subscriptions.push(fn())
    }
  }

  function suspend<T>(data: Promise<T>): Promise<T>
  function suspend<T>(
    data: Readable<T>,
    error?: Readable<Error | undefined>
  ): Readable<T>
  function suspend<T>(
    data: Promise<T> | Readable<T>,
    error?: Readable<Error | undefined>
  ): Promise<T> | Readable<T> {
    effectRunner(() => {
      if ('then' in data) {
        return interal_suspend.promise(data)
      } else {
        return interal_suspend.store(data, error)
      }
    })
    return data
  }
  return addUtilityFunctions(suspend)
}

export function setContext(value: InternalSuspend) {
  set(key, value)
}

function base_suspend<T>(data: Promise<T>): Promise<T>
function base_suspend<T>(
  data: Readable<T>,
  error?: Readable<Error | undefined>
): Readable<T>
function base_suspend<T>(
  data: Promise<T> | Readable<T>,
  error?: Readable<Error | undefined>
): Promise<T> | Readable<T> {
  const interal_suspend = getContext<InternalSuspend | undefined>(key)
  if (!interal_suspend) {
    console.warn('`suspend` called outside of a Suspense boundary')
    return data
  }

  $effect(() => {
    if ('then' in data) {
      return interal_suspend.promise(data)
    } else {
      return interal_suspend.store(data, error)
    }
  })
  return data
}
export const suspend = addUtilityFunctions(base_suspend)

function addUtilityFunctions(suspend: BaseSuspend): Suspend {
  const all = ((...args) => {
    const promise = Promise.all(args)
    return suspend(promise)
  }) satisfies Suspend['all']
  return Object.assign(suspend, { all })
}
