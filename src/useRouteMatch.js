// @flow

import * as React from 'react'
import { useRouteMatch, useLocation } from 'react-router'
import type { Match } from 'react-router'
import {
  parseParams,
  type ParamParsers,
  type ParamParseErrors,
  type QueryParser,
} from './Route'

export type MatchPathOptions<Params: { ... }, Query: { ... }> = {|
  path?: string | string[],
  exact?: boolean,
  strict?: boolean,
  sensitive?: boolean,
  paramParsers?: ParamParsers<Params>,
  queryParser?: QueryParser<Query>,
|}

export type UseRouteMatchResult<Params: { ... }, Query: { ... }> = {|
  match: Match | null,
  params: Params,
  query: Query,
  error?: Error,
  paramParseError?: Error,
  paramParseErrors?: ParamParseErrors<Params>,
  queryParseError?: Error,
|}
export default function parsedUseRouteMatch<Params: { ... }, Query: { ... }>({
  paramParsers,
  queryParser,
  ...matchPathOptions
}: MatchPathOptions<Params, Query>): UseRouteMatchResult<Params, Query> {
  const match = useRouteMatch(matchPathOptions)
  const location = useLocation()

  const { params, paramParseError, paramParseErrors } = React.useMemo((): {|
    params: Params,
    paramParseError?: Error,
    paramParseErrors?: ParamParseErrors<Params>,
  |} => {
    let params: Params = ({}: any)
    let paramParseError
    let paramParseErrors
    try {
      if (match) params = parseParams(match, paramParsers)
    } catch (error) {
      paramParseError = error
      paramParseErrors = error.params
    }
    return { params, paramParseError, paramParseErrors }
  }, [match, paramParsers])

  const { query, queryParseError } = React.useMemo((): {|
    query: Query,
    queryParseError?: Error,
  |} => {
    let query: Query = ({}: any)
    let queryParseError
    try {
      if (queryParser) query = queryParser(location.search)
    } catch (error) {
      queryParseError = error
    }
    return { query, queryParseError }
  }, [queryParser, location.search])

  if (paramParseError || queryParseError) {
    return {
      match,
      params,
      query,
      error: paramParseError || queryParseError,
      paramParseError,
      paramParseErrors,
      queryParseError,
    }
  }

  return {
    match,
    params,
    query,
  }
}
