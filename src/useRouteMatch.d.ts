import { match } from 'react-router'
import { ParamParseErrors, ParamParsers, QueryParser } from './Route'

export type MatchPathOptions<
  Params extends object = {},
  Query extends object = {}
> = {
  path?: string | string[]
  exact?: boolean
  strict?: boolean
  sensitive?: boolean
  paramParsers?: ParamParsers<Params>
  queryParser?: QueryParser<Query>
}

export type UseRouteMatchResult<
  Params extends object = {},
  Query extends object = {}
> = {
  match: match | null
  params: Params
  query: Query
  error?: Error
  paramParseError?: Error
  paramParseErrors?: ParamParseErrors<Params>
  queryParseError?: Error
}

export default function parsedUseRouteMatch<
  Params extends object = {},
  Query extends object = {}
>(options: MatchPathOptions<Params, Query>): UseRouteMatchResult<Params, Query>
