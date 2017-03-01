import * as webpack from 'webpack'
import * as serveBundle from 'webpack-dev-middleware'
import * as reload from 'webpack-hot-middleware'
import { RequestHandler } from 'express';

import { renderSPAShell } from './render';
import { BuildConfig, Config } from '../api/config';
import { composeMiddleware } from '../util/compose-middleware';
import { getWebpackConfig } from '../packager/generate-webpack-config';

export function devserver(config: BuildConfig) {
  const compiler = webpack(getWebpackConfig({ ...config, server: false }))

  return composeMiddleware(
    serveBundle(compiler),
    reload(compiler),
    renderMiddeware(config)
  )
}

function renderMiddeware(config: Config): RequestHandler {
  return (req, res, next) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write('<!doctype html>' + renderSPAShell())
    res.end()
  }
}
