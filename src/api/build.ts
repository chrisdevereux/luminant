import * as webpack from 'webpack'
import * as path from 'path'

import { Config, BuildConfig, getBuildConfig } from '../api/config';
import { getWebpackConfig } from '../packager/generate-webpack-config';

export function build(config: Config, dir: string) {
  const buildConfig = getBuildConfig(config)

  return Promise.all([
    buildVarant(buildConfig, { outDir: path.join(dir, 'public'), server: false }),
    buildVarant(buildConfig, { outDir: dir, server: true }),
  ])
}

function buildVarant(config: BuildConfig, opts: { outDir: string, server: boolean }) {
  const compiler = webpack(getWebpackConfig({ ...getBuildConfig(config), ...opts }))

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error)
        return
      }

      if (stats.hasErrors()) {
        console.error(stats.toString('errors-only'));
      }

      if (stats.hasWarnings()) {
        console.warn(stats.toString())
      }

      resolve()
    })
  })
}
