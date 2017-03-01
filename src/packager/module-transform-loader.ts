import { arrayify } from '../util/helpers';
/**
 * Webpack loader that injects code to run before and after a module
 * is first loaded.
 *
 * The loader takes a module name as its `transformer` param.
 * The transform module should export as its default value a function of
 * type `(resolve: () => Module): Module`
 */

module.exports = function (this: LoaderContext) {
  const modulesOpt = loaderUtils.getOptions(this).modules
  if (!modulesOpt) throw new Error('Missing modules option')

  const modules = arrayify(modulesOpt)
  modules.forEach(m => this.addDependency(m))

  return [
    `var transformer = require('${this.resourcePath}').default;`,
    `var modules = [${
      modules.map(m =>
         `function () { return require('${m}'); }`
      ).join(', ')
    }];`,
    `module.exports = transformer(modules);`
  ].join('\n')
}

export interface LoaderContext {
  query: { [key: string]: string | undefined }
  resourcePath: string
  context: string

  resolve(context: string, request: string, callback: (err: {}, result: string) => void): void
  addDependency(file: string): void
}

const loaderUtils: {
  getOptions(ctx: LoaderContext): any
} = require("loader-utils")
