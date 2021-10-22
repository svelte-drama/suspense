import { getContext, setContext as set } from 'svelte'
import type { Readable } from 'svelte/store'

const key = {}

function mock<T extends Promise<unknown>>(data: T): T
function mock<T extends Readable<unknown>>(
  data: T,
  error?: Readable<Error | undefined>
): T
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mock(data: unknown, error = undefined) {
  return data
}

export function createSuspense() {
  const suspend = getContext(key) as typeof mock
  if (suspend) return suspend

  console.warn('createSuspense called outside of a Suspense boundary')
  return mock
}

export function setContext<T>(value: T) {
  set(key, value)
}
