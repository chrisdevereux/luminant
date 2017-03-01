import * as webpack from 'webpack'
import * as path from 'path'
import * as serveBundle from 'webpack-dev-middleware'
import * as reload from 'webpack-hot-middleware'
import { RequestHandler } from 'express';

import { renderSPAShell, renderBody, renderData, renderHeader } from '../page-server/render';
import { Config, getBuildConfig } from '../api/config';
import { composeMiddleware } from '../util/compose-middleware';
import { getWebpackConfig } from '../packager/generate-webpack-config';
import { AnyRoute } from './route';
import { RouteRecognizer } from '../core/router';
import { mountRoute } from '../core/mount-route';

export function devServer(config: Config) {
  const compiler = webpack(getWebpackConfig({ ...getBuildConfig(config), server: false, outDir: '' }))
  const html = '<!doctype html>' + renderSPAShell()

  return composeMiddleware(
    serveBundle(compiler),
    reload(compiler),
    (req, res, next) => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(html)
      res.end()
    }
  )
}

export function pageServer(bundlePath: string): RequestHandler {
  const routes = require(path.resolve(bundlePath))
  const router = new RouteRecognizer<AnyRoute>()

  if (routes.length === 0) {
    throw new Error('No routes exported from bundle ' + bundlePath)
  }

  routes.forEach((r: AnyRoute) => {
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
