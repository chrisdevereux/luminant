import * as webpack from 'webpack'
import * as path from 'path'
import { map, fromPairs } from 'lodash'
import * as ExtractText from 'extract-text-webpack-plugin'

import { getRouteFiles } from './get-routes';
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
      extensions: ['.ts', '.tsx', '.js', '.json'],
      modules: [
        // Needed to run locally linked luminant
        path.resolve(path.join(__dirname, '..', 'node_modules')),
        'node_modules'
      ]
    },

    resolveLoader: {
      extensions: ['.ts', '.tsx', '.js'],
      modules: [
        // Needed to run locally linked luminant
        path.resolve(path.join(__dirname, '..', 'node_modules')),
        'node_modules'
      ]
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
        {
          test: /\.scss$/,
          use: ExtractText.extract({
            fallback: 'style-loader',
            use: ['css-loader?modules&localIdentName=[name]__[local]', 'sass-loader']
          })
        },
        {
          test: /\.css$/,
          use: ExtractText.extract({
            fallback: 'style-loader',
            use: ['css-loader']
          })
        },
        ...(config.loaders || [])
      ]
    },

    plugins: [
      new webpack.DefinePlugin(environment()),
      ...ifDebug(config, [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
      ]),
      ...ifProduction(config, [
        new ExtractText({
          filename: 'style.css',
        })
      ])
    ]
  }
}

function ifDebug<T>(config: Config, x: T[]) {
  return config.debug ? x : []
}

function ifProduction<T>(config: Config, x: T[]) {
  return !config.debug ? x : []
}

function environment() {
  return fromPairs(
    map(process.env, (value, key) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ])
  )
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

  // [todo] - Filter out files containing no modules without calling require
  // (and breaking non-js dependencies)
  const modules = getRouteFiles(paths)

  return [
    transformLoader,
    '?', modules.map(m => `modules[]=${m}`).join('&'),
    '!', transformer
  ].join('')
}

