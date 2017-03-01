import { Configuration } from 'webpack'
import * as path from 'path'

import { getRouteFiles, getRoutesFromFiles } from './get-routes';
import { BuildConfig, PathPattern } from '../api/config';
import { shouldExternaliseModule } from './external-module-check';

export interface PackagerConfig extends BuildConfig {
  server: boolean
  outDir: string
}

export function getWebpackConfig(config: PackagerConfig): Configuration {
  return {
    target: config.server ? 'node' : 'web',

    devtool: config.debug ? 'eval-source-map' : undefined,

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },

    entry: entrypoints(config),

    externals: config.server ? shouldExternaliseModule : undefined,

    output: {
      path: path.resolve(config.outDir),
      filename: config.server ? 'server.js' : 'bundle.js',
      library: config.server ? 'server' : undefined,
      libraryTarget: config.server ? 'commonjs2' : undefined
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            silent: true,
            compilerOptions: {
              noEmitOnError: false,
              declaration: false,
            }
          }
        },
      ]
    }
  }
}

function entrypoints(config: PackagerConfig) {
  if (config.server) {
    return wrapEntrypoints(config.paths, '../page-server/server-bootstrap')

  } else {
    return wrapEntrypoints(config.paths, '../runtime/client-module-bootstrap')
  }
}

function wrapEntrypoints(paths: PathPattern, transformerPath: string) {
  const transformLoader = path.resolve(__dirname, './module-transform-loader.ts')
  const transformer = path.resolve(__dirname, transformerPath)
  const modules = getRouteFiles(paths)
    .filter(c => getRoutesFromFiles([c]).length > 0)

  return [
    transformLoader,
    '?', modules.map(m => `modules[]=${m}`).join('&'),
    '!', transformer
  ].join('')
}
