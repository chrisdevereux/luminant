import { NewLoaderRule } from 'webpack'
import { withDefault } from '../util/helpers';

export type PathPattern = string | string[]

export type Config = SourceGroup & Partial<ConfigOptions>
export type BuildConfig = SourceGroup & ConfigOptions

export interface SourceGroup {
  paths: PathPattern
  loaders?: NewLoaderRule[]
}

export interface ConfigOptions {
  debug: boolean
  // publicPath: string

  // minify: boolean
  // minifyConfig: UglifyPluginOptions

  // loaders: NewLoaderRule[]
  // plugins: Plugin[]
}

export function getBuildConfig(config: Config): BuildConfig {
  const debug = withDefault(process.env.NODE_ENV !== 'production', config.debug)

  return {
    ...config,
    debug,
  }
}
