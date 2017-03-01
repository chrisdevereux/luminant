import * as React from 'react'
import { assign, merge } from 'lodash'

import { isPromiseLike } from '../util/helpers';
import { Route, AnyRoute, MountValue, Mount, MountFn } from '../api/route';

export const ROUTE_IDENTIFIER = Symbol('LuminantRoute')

export function makeRoute<T>(x: T): T & AnyRoute {
  if (isRoute(x)) {
    return x as any
  }

  markIsRoute(x)
  return assign(x, {
    paths: [],
    routeWillMount: defaultMount
  })
}

export function injectComponentRender(RouteComponent: React.ComponentClass<{}> & AnyRoute) {
  RouteComponent.routeWillMount = composeMountFunctions(RouteComponent.routeWillMount, props => ({
    body: <RouteComponent {...props} />
  }))
}

export function isRoute(x: any): x is Route<{}> {
  return x[ROUTE_IDENTIFIER]
}

function markIsRoute(x: any) {
  x[ROUTE_IDENTIFIER] = true
}

function defaultMount() {
  return {}
}

function composeMountFunctions<Props>(parent: MountFn<Props>, child: MountFn<Props>): MountFn<Props> {
  return (props: Props) => (
    transformMount(parent(props), inheritedMount => {
      if (!isOK(inheritedMount)) return inheritedMount

      return transformMount(child(props), (thisMount): Mount => ({
          ...inheritedMount,
          ...thisMount,
          prefetch: mergePrefetchedData([thisMount.prefetch, inheritedMount.prefetch])
      }))
    })
  )
}

export function transformMount(value: MountValue, fn: (x: Mount) => MountValue): MountValue {
  if (isPromiseLike(value)) {
    return value.then(fn)

  } else {
    return fn(value)
  }
}

function mergePrefetchedData<T>(xs: (Promise<T> | undefined)[]): Promise<T> | undefined {
  const promises = xs.filter(x => typeof x !== 'undefined') as Promise<T>[]

  if (promises.length === 0) return undefined
  return Promise.all(promises).then(merge)
}

function isOK(x: Mount) {
  return (typeof x.status === 'undefined') || x.status === 200
}
