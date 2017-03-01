export interface RouteRecognizer<H> {
  add: (routes: RouteSpec<H>[]) => void
  recognize: (path: string) => MatchedRoute<H>[]
}

export interface RouteRecognizerStatic {
  new<T>(): RouteRecognizer<T>
}

export interface RouteSpec<H> {
  path: string
  handler: H
}

export interface MatchedRoute<H> {
  handler: H
  params: { [key: string]: string }
}

export const RouteRecognizer: RouteRecognizerStatic = require('route-recognizer')
