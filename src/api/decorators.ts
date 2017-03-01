import * as React from 'react'

import { makeRoute, injectComponentRender } from '../core/route';

export interface RouteDecotator<T> {
  (x: T): void
}

export type ComponentDecorator = RouteDecotator<React.ComponentClass<{}>>

/**
 * Marks a react component as a route
 */
export function route(path: string): ComponentDecorator {
  return (component: React.ComponentClass<{}>) => {
    const route = makeRoute(component)
    injectComponentRender(route)

    route.paths = [...route.paths, path]
  }
}
