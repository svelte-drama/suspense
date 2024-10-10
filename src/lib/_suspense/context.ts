import { getContext, setContext as set } from 'svelte'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

export type Suspend = {
  <T>(data: Promise<T>): Promise<T>
}

function mock<T>(data: T) {
  return data
}

export function createSuspense(): Suspend {
  const suspend = getContext<Suspend>(key)
  if (!suspend) {
    console.warn('createSuspense called outside of a Suspense boundary')
    return mock
  }

  return suspend
}

export function setContext(value: Suspend) {
  set(key, value)
}
