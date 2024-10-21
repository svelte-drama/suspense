import { getContext, onDestroy, setContext as set } from 'svelte'
import type { Readable } from 'svelte/store'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

export type InternalSuspend = {
  promise<T>(data: Promise<T>): () => void
  store<T>(data: Readable<T>, error?: Readable<Error | undefined>): () => void
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

function mock<T>(data: T) {
  return data
}
mock.all = ((...data) => {
  return Promise.all(data)
}) satisfies Suspend['all']

export function createSuspense(): Suspend {
  const interal_suspend = getContext<InternalSuspend>(key)
  if (!interal_suspend) {
    console.warn('createSuspense called outside of a Suspense boundary')
    return mock
  }

  const effect_runner = createEffectRunner()

  function suspend<T>(data: Promise<T>): Promise<T>
  function suspend<T>(
    data: Readable<T>,
    error?: Readable<Error | undefined>
  ): Readable<T>
  function suspend<T>(
    data: Promise<T> | Readable<T>,
    error?: Readable<Error | undefined>
  ) {
    effect_runner(() => {
      if ('then' in data) {
        return interal_suspend.promise(data)
      } else {
        return interal_suspend.store(data, error)
      }
    })
    return data
  }
  suspend.all = ((...args) => {
    const promise = Promise.all(args)
    return suspend(promise)
  }) satisfies Suspend['all']
  return suspend
}

function createEffectRunner() {
  const subscriptions: (() => void)[] = []
  onDestroy(() => {
    for (const unsub of subscriptions) {
      unsub()
    }
  })

  return function (fn: () => () => void) {
    if ($effect.tracking()) {
      $effect(fn)
    } else {
      subscriptions.push(fn())
    }
  }
}

export function setContext(value: InternalSuspend) {
  set(key, value)
}
