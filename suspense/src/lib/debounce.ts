import { tick } from 'svelte'

type func = ((...args: unknown[]) => unknown)
export default function debounce<T extends func> (fn: T) {
  let guard: unknown

  return async function (...args: Parameters<T>) {
    const inner = {}
    guard = inner

    await tick()

    if (inner === guard) {
      fn(...args)
    }
  }
}
