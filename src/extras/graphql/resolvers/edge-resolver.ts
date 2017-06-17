import * as DataLoader from 'dataloader'

import { GraphNode } from './node-resolver'
import { Resource, ResourceId, ResourceQuery, ResourceQueryParams } from '../resources/resource';

export interface Context {
  headers: { [key: string]: string }
  getResourceLoader: <T>(resource: Resource<T>) => DataLoader<ResourceId, T>
  getQueryLoader: <Q extends ResourceQueryParams, T>(query: ResourceQuery<Q, T>) => DataLoader<Q, T>
}

export interface GraphEdgeResolveParams<Query> {
  id: ResourceId
  query: Query
  context: Context
}

export interface GraphEdge<Dest, Query = undefined> {
  (params: GraphEdgeResolveParams<Query>): Promise<Dest>
}

export interface QueryType {

}

export function property<T, Key extends keyof T>(
  resource: Resource<T>,
  key: Key
): GraphEdge<T[Key]> {
  return ({ id, context }) => context
    .getResourceLoader(resource).load(id)
    .then((x) => x[key])
}

export function query<T, , Query>(
  resource: Resource<T>,
  key: Key,
  query: (Query),
): GraphEdge<ResourceId> {
  return ({ id, context }) => context
    .getQueryLoader(resource).load(q)
}

function getQueryKey(x: string) {

}
