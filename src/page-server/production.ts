import { RequestHandler } from 'express';

import { renderHeader, renderBody, renderData } from './render';
import { RouteRecognizer } from '../core/router';
import { mountRoute } from '../core/mount-route';
import { getRoutesFromFiles, getRouteFiles } from '../packager/get-routes';
import { BuildConfig } from '../api/config';
import { AnyRoute } from '../api/route';

export function pageServer(config: BuildConfig): RequestHandler {
  const routes = getRoutesFromFiles(getRouteFiles(config.buildDir))
  const router = new RouteRecognizer<AnyRoute>()

  routes.forEach(r => {
    r.paths.forEach(path => router.add([{ path, handler: r }]))
  })

  return (req, res, next) => {
    try {
      const params = {
        path: req.path
      }

      mountRoute(router, params, (err, mount) => {
        if (!mount) {
          next(err || new Error('Page mount failed without returning an error message'))
          return
        }

        res.writeHead(mount.status || 200, { 'Content-Type': 'text/html' })
        res.write(`<!doctype html><html>${renderHeader(mount)}`)

        if (mount.prefetch) {
          mount.prefetch.then(data => {
            res.write(`${renderBody(mount.body)}${renderData(data)}</html>`)
            res.end()
          })
          .catch(err => {
            // [todo] - Error handler
            res.write(`<body>${err.message}</body></html>`)
            res.end()
          })

        } else {
          res.write(`${renderBody(mount.body)}</html>`)
          res.end()
        }
      })

    } catch (err) {
      next(err)
    }
  }
}
