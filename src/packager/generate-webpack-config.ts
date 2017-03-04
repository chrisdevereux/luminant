import * as webpack from 'webpack'
import * as path from 'path'

import { getRouteFiles, getRoutesFromFiles } from './get-routes';
import { BuildConfig, PathPattern, Config } from '../api/config';
import { shouldExternaliseModule } from './external-module-check';

export interface PackagerConfig extends BuildConfig {
  server: boolean
  outDir?: string
}

export function getWebpackConfig(config: PackagerConfig): webpack.Configuration {
  return {
    target: config.server ? 'node' : 'web',

    devtool: config.debug ? 'eval-source-map' : undefined,

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },

    resolveLoader: {
      extensions: ['.ts', '.tsx', '.js']
    },

    entry: [
      ...ifDebug(config, [
        'webpack-hot-middleware/client?reload=true',
      ]),
      entrypoints(config)
    ],

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
    },

    plugins: [
      ...ifDebug(config, [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ])
    ]
  }
}

function ifDebug<T>(config: Config, x: T[]) {
  return config.debug ? x : []
}

function entrypoints(config: PackagerConfig) {
  if (config.server) {
    return wrapEntrypoints(config.paths, '../page-server/server-bootstrap')

  } else {
    return wrapEntrypoints(config.paths, '../runtime/client-module-bootstrap')
  }
}

function wrapEntrypoints(paths: PathPattern, transformerPath: string) {
  const transformLoader = path.resolve(__dirname, './module-transform-loader')
  const transformer = path.resolve(__dirname, transformerPath)
  const modules = getRouteFiles(paths)
    .filter(c => getRoutesFromFiles([c]).length > 0)

  return [
    transformLoader,
    '?', modules.map(m => `modules[]=${m}`).join('&'),
    '!', transformer
  ].join('')
}

