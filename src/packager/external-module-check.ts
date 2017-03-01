import * as path from 'path'

export function shouldExternaliseModule(context: string, req: string, cb: (err?: {}, result?: string) => {}): {} {
  const match = req[0] !== '.' && req[0] !== '/' && !path.extname(req)

  if (match) {
    return cb(undefined, 'commonjs ' + req)
  }

  return cb()
}
