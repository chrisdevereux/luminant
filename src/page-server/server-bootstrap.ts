import { flatMap, values } from 'lodash'
import { isRoute } from '../core/route';

export interface ModuleLoader {
  (): any
}

export default function serverBootstrap(moduleLoaders: ModuleLoader[]) {
  return flatMap(moduleLoaders.map(r => r()), values).filter(isRoute)
}
