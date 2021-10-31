export const READY = Symbol('READY')
export const LOADING = Symbol('LOADING')
export const HIDDEN = Symbol('HIDDEN')

export type STATUS_VALUES = typeof READY | typeof LOADING | typeof HIDDEN
