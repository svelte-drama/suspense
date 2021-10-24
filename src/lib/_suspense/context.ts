import { getContext, setContext as set } from 'svelte'
import type { Readable } from 'svelte/store'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

type Suspend = {
  <T extends Promise<unknown>>(data: T): T
  <T extends Readable<unknown>>(data: T, error?: Readable<Error | undefined>): T
}
const mock: Suspend = (data: unknown) => {
  return data
}

export function createSuspense() {
  const suspend: Suspend = getContext(key)
  if (suspend) return suspend

  console.warn('createSuspense called outside of a Suspense boundary')
  return mock
}

export function setContext(value: Suspend) {
  set(key, value)
}
