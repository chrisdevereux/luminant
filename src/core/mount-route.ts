import { AnyRoute, Mount } from '../api/route';
import { isPromiseLike } from '../util/helpers';
import { RouteRecognizer } from '../core/router';

export interface MountParams {
  path: string
}

export interface MountRequest extends MountParams {
  params: { [key: string]: string }
}

export function mountRoute(router: RouteRecognizer<AnyRoute>, params: MountParams, cb: (err?: {}, mount?: Mount) => void) {
  try {
    const matches = router.recognize(params.path)
    if (!matches || matches.length === 0) {
      cb()
      return
    }

    const [match] = matches
    const mount = match.handler.routeWillMount(match.params)

    if (isPromiseLike(mount)) {
      mount.then(x => cb(undefined, x), cb)
      return
    }

    cb(undefined, mount)

  } catch (err) {
    cb(err)
  }
}
