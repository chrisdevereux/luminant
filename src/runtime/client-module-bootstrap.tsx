// [todo] - Make polyfilling optional
require('core-js')

import * as React from 'react'
import { Location } from 'history'
import { flatMap, values } from 'lodash'

import { AnyRoute } from '../api/route';
import { isRoute } from '../core/route';
import { history } from './history';
import { render } from './render';
import { RouteRecognizer } from '../core/router';
import { mountRoute } from '../core/mount-route';


let startRequested = false
const router = new RouteRecognizer<AnyRoute>()

export interface ModuleLoader {
  (): any
}

export default function clientModuleBootstrap(moduleLoaders: ModuleLoader[]) {
  const exports = flatMap(moduleLoaders.map(r => r()), values)

  exports.forEach(route => {
    if (!isRoute(route)) {
      return
    }

    if (!route.paths) {
      return
    }

    route.paths.forEach(path => {
      router.add([{ path, handler: route }])
    })
  })

  if (!startRequested) {
    startRequested = true

    window.addEventListener('load', () => {
      mountLocation(history().location, () => {
        postLoadedEvent()
      })
      history().listen(location => mountLocation(location))
    })
  }
}

export function postLoadedEvent() {
  if (typeof CustomEvent === 'undefined') return
  window.dispatchEvent(new CustomEvent('luminantAppLoad'))
}

export function mountLocation(location: Location, cb?: () => void) {
  const params = { path: location.pathname }

  mountRoute(router, params, (err, mount) => {
    if (!mount) {
      handleError(err)
      if (cb) cb()
      return
    }

    if (!mount.body) {
      handleError(new Error('No body returned from page load'))

      if (cb) cb()
      return
    }

    if (mount.prefetch) {
      mount.prefetch.then(() => {
        render(mount.body)
        if (cb) cb()
      })

    } else {
      render(mount.body)
      if (cb) cb()
    }
  })
}

function handleError(err?: any) {
  render(<div>{err.message}</div>)
}