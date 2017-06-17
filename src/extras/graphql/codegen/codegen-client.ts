import * as graphql from 'graphql'
import { fromPairs } from 'lodash'

import { unsupported, unexpected } from '../../../util/helpers'
import { Type, Interface, Query } from './typescript-utils'

export interface CodegenContext {
  emitInterface(i: Interface) : void
  emitQuery(q: Query) : void

  getSchemaType(typeName: string, field?: string): Type
}

export function codegenClient(node: graphql.DocumentNode, ctx: CodegenContext) {
  node.definitions.forEach(def => codegenDefinitionNode(def, ctx))
}

export function codegenDefinitionNode(node: graphql.DefinitionNode, ctx: CodegenContext) {
  if (node.kind === 'OperationDefinition') {
    return codegenOperation(node, ctx)
  }

  return unsupported(node.kind, 'definition type')
}

export function codegenOperation(node: graphql.OperationDefinitionNode, ctx: CodegenContext) {
  const paramType = node.name!.value + 'Params'
  const resultType = node.name!.value + 'Result'

  // Emit param interface
  ctx.emitInterface({
    name: paramType,
    variables: fromPairs(
      node.variableDefinitions!.map(({ variable, type }) => [variable.name.value, getType(type)])
    )
  })

  // Emit param interface
  ctx.emitInterface({
    name: resultType,
    variables: getSelectionFields(node.selectionSet!.selections, ctx, 'Query'),
  })

  // Emit data
  ctx.emitQuery({
    name: node.name!.value,
    value: node,
    paramType,
    resultType
  })
}

export function getType(node: graphql.TypeNode): Type {
  if (node.kind === 'NonNullType') {
    return {
      ...getType(node.type),
      optional: false,
    }
  }

  if (node.kind === 'NamedType') {
    return {
      kind: 'named',
      name: qualifiedTypeName(node.name.value),
      optional: true,
    }
  }

  if (node.kind === 'ListType') {
    return {
      kind: 'named',
      name: 'Array',
      optional: true,
    }
  }

  return unexpected(node, 'type')
}

export function getSelectionFields(nodes: graphql.SelectionNode[], ctx: CodegenContext, parentType: string): Record<string, Type> {
  return fromPairs(
    nodes.map(x => {
      if (x.kind === 'Field') {
        const name = (x.alias || x.name).value
        const type = ctx.getSchemaType(parentType, x.name.value)

        if (x.selectionSet) {
          return [name, { kind: 'shape', fields: getSelectionFields(x.selectionSet.selections, ctx, type), optional: true }]

        } else {
          return [name, type]
        }
      }

      return unsupported(x.kind, 'selection type')
    })
  )
}

function qualifiedTypeName(typeName: string) {
  return `Schema.${typeName}`
}
