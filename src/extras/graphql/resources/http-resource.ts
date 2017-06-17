import { keyBy } from 'lodash'

import { Resource, ResourceShape, ResourceId, ResourceResult, ResourceQuery, ResourceQueryParam } from './resource';

export interface HttpResourceProps<T> {
  url: (params: ResourceId[]) => string[]
  identify: (x: T, i: number) => ResourceId
  shape: ResourceShape<T>
  method?: string
  body?: string | Buffer
  httpClient?: (url: string, req?: RequestInit) => Promise<Response>
}

export interface HTTPResource<T> extends Resource<T> {

}

class HttpRequestError implements Error {
  readonly message: string
  readonly status: number
  
  get name() {
    return 'HTTPRequestError'
  }

  constructor(status: number, message: string) {
    this.status = status
    this.message = message
  }
}

export function createHttpResource<T>(props: HttpResourceProps<T>): HTTPResource<T> {
  const { method = 'GET', url, shape, body, identify, httpClient = fetch } = props

  return {
    async resolve(params: ResourceId[]) {
      const res = await httpClient(stringifyUrl(url(params)), {
        method,
        body
      })

      if (res.ok) {
        const result = shape(await res.text())
        const indexedResults = keyBy(result, identify)

        return params.map((key): ResourceResult<T> => {
          if (indexedResults[key]) {
            return { kind: 'success', payload: indexedResults[key] }

          } else {
            return { kind: 'error', error: new HttpRequestError(404, 'Not Found') }
          }
        })
      }

      throw new HttpRequestError(res.status, res.statusText)
    },
  }
}

export interface HttpResourceQueryProps<Q extends ResourceQueryParam, T> {
  url: (q: Q) => string[]
  identify: (x: T, i: number) => ResourceId
  shape: ResourceShape<T>
  method?: string
  body?: string | Buffer
  httpClient?: (url: string, req?: RequestInit) => Promise<Response>
}

export interface HttpResourceQuery<Q extends ResourceQueryParam, T> extends ResourceQuery<Q, T> {

}

export function createHttpQuery<Q extends ResourceQueryParam, T>(props: HttpResourceQueryProps<Q, T>): HttpResourceQuery<Q, T> {
  const { method = 'GET', url, shape, body, identify, httpClient = fetch } = props

  return {
    async resolve(q: Q): Promise<Record<string, T>> {
      const res = await httpClient(stringifyUrl(url(q)), {
        method,
        body
      })

      if (res.ok) {
        const result = shape(res.text())
        return keyBy(result, identify)
      }

      throw new HttpRequestError(res.status, res.statusText)
    },
  }
}

function stringifyUrl(url: string[]) {
  return url.join('/')
}
