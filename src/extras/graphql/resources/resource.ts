export type ResourceId = string | number

export interface Resource<T> {
  resolve(params: ResourceId[]): Promise<ResourceResult<T>[]>
}

export type ResourceResult<T>
  = { kind: 'success', payload: T }
  | { kind: 'error', error: Error }

export interface ResourceQuery<Q extends ResourceQueryParams, T> {
  resolve(params: Q): Promise<Record<string, T>>
}

export interface ResourceQueryParams {
  [key: string]: ResourceQueryParam
}

export type ResourceQueryParam
  = string
  | number
  | string[]
  | number[]

export interface ResourceShape<T> {
  (x: any): T[]
}

export function shape<T>(): ResourceShape<T> {
  return (x) => x
}
