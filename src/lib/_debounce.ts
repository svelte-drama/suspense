import { tick } from 'svelte'

export default function debounce<Fn extends (...args: unknown[]) => unknown>(fn: Fn) {
  let guard: unknown

  return async function (...args: Parameters<Fn>) {
    const inner = {}
    guard = inner

    await tick()

    if (inner === guard) {
      fn(...args)
    }
  }
}
