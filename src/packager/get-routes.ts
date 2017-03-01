import * as glob from 'glob'
import * as path from 'path'
import { flatMap, filter } from 'lodash'

import { arrayify } from '../util/helpers';
import { isRoute } from '../core/route';
import { AnyRoute } from '../api/route';

export function getRouteFiles(entrypoints: string[] | string): string[] {
  return flatMap(arrayify(entrypoints), x => glob.sync(x).map(x => path.resolve(x)))
}

export function getRoutesFromFiles(files: string[]): AnyRoute[] {
  return flatMap(files.map(require), (xs: AnyRoute[]) => filter(xs, isRoute))
}
