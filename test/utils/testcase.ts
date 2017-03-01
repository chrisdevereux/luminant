import * as http from 'http'
import * as express from 'express'
import * as url from 'url'
import * as fs from 'fs'
import * as rimraf from 'rimraf'
import * as path from 'path'
import * as phantom from 'phantom'
import { expect } from 'chai'
import { map } from 'lodash'
import fetch, { RequestInit, Response } from 'node-fetch'

import * as Luminant from '../../src'
import * as LuminantServer from '../../src/server'

export interface DevserverTestConfig {
  luminantConfig: Luminant.Config
}

export interface ProdTestConfig {
  luminantConfig: Luminant.Config
}

export class Testcase {
  private config: Luminant.Config
  private server: http.Server & { shutdown(cb: () => void): void }
  private phantom: phantom.PhantomJS

  static createDevServer({ luminantConfig }: DevserverTestConfig) {
    const instance = new Testcase(luminantConfig)

    before(async () => {
      await Promise.all([
        instance.initDevServer(),
        instance.initPhantom()
      ])
    })

    after(() => {
      return instance.stop()
    })

    return instance
  }

  static createProdServer({ luminantConfig }: ProdTestConfig) {
    const instance = new Testcase(luminantConfig)
    const buildPath = 'test/build'

    before(async () => {
      rimraf.sync(buildPath)
      fs.mkdirSync(buildPath)

      await instance.build(buildPath)
      await Promise.all([
        instance.initPhantom(),
        instance.initPageServer(path.join(buildPath, 'server'), path.join(buildPath, 'public'))
      ])
    })

    after(async () => {
      await instance.stop()
      rimraf.sync(buildPath)
    })

    return instance
  }

  fetch(path: string, opts?: RequestInit): Promise<Response> {
    return fetch(this.resolve(path), opts)
  }

  print(path: string) {
    return this.fetch(path).then(r => r.text()).then(console.log)
  }

  async visit(path: string) {
    const page = await this.phantom.createPage()
    const browser = new Browser(page)

    await browser.init(this.resolve(path))
    return browser
  }

  private constructor(config: Luminant.Config) {
    this.config = config
  }

  private resolve(path: string) {
    return url.format({
      protocol: 'http:',
      pathname: path,
      hostname: 'localhost',
      port: String(this.server.address().port)
    })
  }

  private stop() {
    this.phantom.exit()
    return new Promise(resolve => this.server.shutdown(resolve))
  }

  private build(dir: string) {
    return LuminantServer.build(this.config, dir)
  }

  private initPhantom() {
    return phantom.create().then(instance => {
      this.phantom = instance
    })
  }

  private initDevServer() {
    return new Promise(resolve => {
      const app = express()

      app.use(LuminantServer.devServer(this.config))

      this.server = app.listen(0, () => {
        resolve()
      }) as any

      require('http-shutdown')(this.server)
    })
  }

  private initPageServer(bundle: string, publicDir: string) {
    return new Promise(resolve => {
      const app = express()

      app.use(express.static(publicDir))
      app.use(LuminantServer.pageServer(bundle))

      this.server = app.listen(0, () => {
        resolve()
      }) as any

      require('http-shutdown')(this.server)
    })
  }
}

export class Browser {
  private instance: phantom.WebPage & {
    on: ((name: string, def: Function) => void) & ((name: string, runOnPhantom: boolean, def: Function) => void),
    defineMethod: (name: string, def: Function) => Promise<void>,
    invokeAsyncMethod: (name: string, ...args: any[]) => Promise<any>
  }

  constructor(instance: phantom.WebPage) {
    this.instance = instance as any
  }

  async init(path: string) {
    await Promise.all([
      this.instance.on('onConsoleMessage', console.log),
      this.instance.on('onInitialized', true, function (this: any) {
        this.evaluate(() => {
          window.addEventListener('luminantAppLoad', () => {
            callPhantom({ type: 'luminant:event', eventType: 'luminantAppLoad' })
          })
        })
      })
    ])

    this.instance.open(path)

    await new Promise(resolve => {
      this.addEventListener('luminantAppLoad', resolve, false)
    })
  }

  async addEventListener(event: string, cb: () => void, install: boolean = true) {
    if (install) {
      await this.instance.evaluate((event) => {
        window.addEventListener(event, () => {
          callPhantom({ type: 'luminant:event', eventType: event })
        })
      }, event)
    }

    this.instance.on('onCallback', (msg: any) => {
      if (msg.type === 'luminant:event' && msg.eventType === event) {
        cb()
      }
    })
  }

  print() {
    this.instance.evaluate(() => console.log(document.body.innerHTML))
  }

  $(selector: string) {
    return this.instance.evaluate(selector => document.querySelectorAll(selector), selector)
  }

  assertText(selector: string, expected: string) {
    return this.$(selector)
      .then(mapNodes(x => x.textContent))
      .then(x => expect(x.join('')).to.eql(expected))
  }
}

function mapNodes<T>(fn: (e: Element) => T): (list?: NodeListOf<Element>) => T[] {
  return list => list && map(list, fn) || []
}

declare function callPhantom(data: {}): void