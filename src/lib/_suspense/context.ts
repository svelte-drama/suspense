import { getContext, onDestroy, setContext as set } from 'svelte'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

export type InternalSuspend = {
  <T>(data: Promise<T>): {
    abort: () => void
    result: Promise<T>
  }
}

export type Suspend = {
  <T>(data: Promise<T>): Promise<T>
}

function mock<T>(data: T) {
  return data
}

export function createSuspense(): Suspend {
  const suspend = getContext<InternalSuspend>(key)
  if (!suspend) {
    console.warn('createSuspense called outside of a Suspense boundary')
    return mock
  }

  const subscriptions: (() => void)[] = []
  onDestroy(() => subscriptions.forEach((abort) => abort()))

  function result<T>(data: Promise<T>): Promise<T> {
    const { abort, result } = suspend(data)
    subscriptions.push(abort)
    return result
  }

  return result
}

export function setContext(value: InternalSuspend) {
  set(key, value)
}
