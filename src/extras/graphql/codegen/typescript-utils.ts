import { flatMap } from 'lodash'
const serializeJavascript = require('serialize-javascript')

import { unexpected } from '../../util/helpers'

export interface Interface {
  name: string,
  variables: { [key: string]: Type }
}

export interface Query {
  name: string
  value: {}
  paramType: Type
  resultType: Type
}

export interface NamedType {
  kind: 'named'
  name: string
  params?: Type[]
  optional?: boolean
}

export interface ShapeType {
  kind: 'shape'
  fields: { [key: string]: Type }
  optional: boolean
}

export type Type
  = NamedType
  | ShapeType

export function stringifyInterface({ name, variables }: Interface) {
  return [
    `interface ${name} {`,
    ...indent(stringifyInterfaceFields(variables)),
    `}`,
  ]
}

export function stringifyQuery({ name, value, paramType, resultType }: Query) {
  const paramTypeStr = oneLine(stringifyType(paramType))
  const resultTypeStr = oneLine(stringifyType(resultType))

  return [
    `const ${name}: Query<${paramTypeStr}, ${resultTypeStr}> = {`,
    ...indent([
      ...indent(
        serializeJavascript(value).split('\n'),
        { first: false, prefix: 'ast: ' }
      ),
      ...indent([
        `resolve: (params: ${paramTypeStr}, data: any): ${resultTypeStr} => {`,
        '  return data',
        '}',
      ])
    ]),
    `}`,
  ]
}

export function stringifyInterfaceFields(variables: { [key: string]: Type }): string[] {
  return flatMap(variables, (t, key) =>
    indent(stringifyType(t), { first: false, prefix: `${key}: ` })
  )
}

export function stringifyType(type: Type): string[] {
  if (type.kind === 'named') {
    if (type.params && type.params.length > 0) {
      return [`${type.name}<${type.params.map(stringifyType).join(', ')}>`]

    } else {
      return [type.name]
    }
  }

  if (type.kind === 'shape') {
    return [
      '{',
      ...indent(stringifyInterfaceFields(type.fields)),
      '}',
    ]
  }

  return unexpected(type, 'type')
}

export function indent(lines: string[], opts: { prefix?: string, first: boolean } = { first: true }): string[] {
  if (!opts.first) {
    const [first, ...rest] = lines
    return [first, ...indent(rest)]
  }

  return lines.map(l => '  ' + l)
}

export function oneLine(lines: string[]): string {
  return lines.map(l => l.replace(/\n */g, '')).join(' ')
}
