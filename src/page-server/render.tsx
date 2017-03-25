import * as React from 'react'
import * as ReactDOM from 'react-dom/server'
import { map } from 'lodash'
const serialize = require('serialize-javascript')

import { Prefetch, Mount } from '../api/route'

export function renderHeader(mount: Mount): string {
  return ReactDOM.renderToStaticMarkup(
    <head>
      <meta charSet="utf8" />
      {mount.title && <title>{mount.title}</title>}
      <script src="/bundle.js" />
      <link rel="stylesheet" href="/style.css" />
    </head>
  )
}

export function renderBody(element: React.ReactNode): string {
  return ReactDOM.renderToStaticMarkup(
    <body>
      <div id="app">
        {element}
      </div>
    </body>
  )
}

export function renderData(variables: Prefetch): string {
  return ReactDOM.renderToStaticMarkup(
    <script>
      {map(variables, (val, key) => `${key}=${serialize(val)}`)}
    </script>
  )
}

export function renderSPAShell() {
  return ReactDOM.renderToStaticMarkup(
    <html>
      <head>
        <meta charSet="utf8" />
        <script src="/bundle.js" />
      </head>
      <body>
        <div id="app" />
      </body>
    </html>
  )
}
