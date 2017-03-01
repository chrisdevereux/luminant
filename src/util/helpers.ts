export type Maybe<T> = T | undefined

export function arrayify<T>(x: T[] | T): T[] {
  return Array.isArray(x) ? x : [x]
}

export function isPromiseLike(x: any): x is PromiseLike<{}> {
  return x && typeof x.then === 'function'
}

export function withDefault<T>(defaultVal: T, x: Maybe<T>): T {
  return (typeof x === 'undefined') ? defaultVal : x
}