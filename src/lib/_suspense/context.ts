import { getContext, setContext as set } from 'svelte'
import type { Readable } from 'svelte/store'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

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
