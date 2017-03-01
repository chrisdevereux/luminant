import * as React from 'react'

export interface Route<Props> {
  /** Path patterns rendered by the associated route */
  paths: string[]

  /** Method called on load to validate the route and prefetch data */
  routeWillMount: MountFn<Props>
}

export interface AnyRoute extends Route<{}> {}


export interface Mount {
  /**
   * Status code to be returned when serving page.
   * Defaults to 200
   */
  status?: number

  /**
   * Content of the page <title> element
   */
  title?: string

  /**
   * If present, the URI to redirect to.
   * Must be returned with a 3xx status
   */
  // redirect?: string

  /**
   * If present, an object containing data to pass from server to client.
   *
   * When rendered on a server, the data objects will be passed to the client
   * via route parameters to `routeWillMount`.
   */
  prefetch?: Promise<Prefetch>

  /**
   * Return the react element to render
   */
  body?: React.ReactElement<{}>
}

/** Data object containing rehydration data */
export interface Prefetch {
  [key: string]: {}
}

export type MountFn<Props> = (props: Props) => MountValue
export type MountValue = Mount | Promise<Mount>
