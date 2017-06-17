import * as graphql from 'graphql/language'
import * as fs from 'fs'

export function load(files: string[]): graphql.DocumentNode {
  return files
    .map(name => new graphql.Source(fs.readFileSync(name, 'utf8'), name))
    .map(graphql.parse)
}
