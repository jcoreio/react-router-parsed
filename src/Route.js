// @flow

import * as React from 'react'
import { Route } from 'react-router'
import type { Match, Location, RouterHistory } from 'react-router'

const isEmptyChildren = children => React.Children.count(children) === 0

export type ParamParsers<Params: {}> = $ObjMap<
  Params,
  <Param>(Param) => (string, $Keys<Params>, { match: Match }) => Param
>

export type ParamParseErrors<Params: {}> = $ObjMap<
  Params,
  <Param>(Param) => ?Error
>

export type QueryParser<Query: {}> = (search: string) => Query

type BaseRenderProps = {
  match: Match,
  location: Location,
  history: RouterHistory,
}

export type RenderProps<Params: {}, Query: {}> = {
  match: Match,
  location: Location,
  history: RouterHistory,
  params: Params,
  query: Query,
}

export type ChildrenProps<Params: {}, Query: {}> = {
  match: ?Match,
  location: Location,
  history: RouterHistory,
  params: Params,
  query: Query,
}

export type ErrorProps<Params: {}> = {
  match: ?Match,
  location: Location,
  history: RouterHistory,
  paramParseError: ?Error,
  paramParseErrors: ?ParamParseErrors<Params>,
  queryParseError: ?Error,
}

type BaseProps = React.ElementProps<typeof Route>

export type Props<Params: {}, Query: {}> = {|
  ...$Diff<
    BaseProps,
    {
      component: any,
      render: any,
      children: any,
    }
  >,
  paramParsers?: ?ParamParsers<Params>,
  queryParser?: ?QueryParser<Query>,
  component?: ?React.ComponentType<*>,
  render?: ?(props: RenderProps<Params, Query>) => ?React.Node,
  children?:
    | React.ComponentType<ChildrenProps<Params, Query>>
    | React.Element<*>,
  renderErrors?: ?(props: ErrorProps<Params>) => ?React.Node,
|}

function parseParams<Params: {}>(
  match: Match,
  paramParsers: ?ParamParsers<Params>
): Params {
  const params = {}
  if (!paramParsers) return (params: any)

  let hasErrors = false
  const errors = {}
  for (let param in paramParsers) {
    try {
      params[param] = paramParsers[param](match.params[param], param, { match })
    } catch (error) {
      hasErrors = true
      errors[param] = error
    }
  }
  if (hasErrors) {
    const error = new Error('Some params failed to parse')
    ;(error: any).params = errors
    throw error
  }
  return (params: any)
}

const convertUndefined = <T>(value: ?T): T | null =>
  value === undefined ? null : value

export default function ParsedRoute<Params: {}, Query: {}>({
  component,
  render,
  children,
  paramParsers,
  queryParser,
  renderErrors,
  ...props
}: Props<Params, Query>): React.Node {
  return (
    <Route {...props}>
      {(props: BaseRenderProps): React.Node | null => {
        const { match, location } = props
        let paramParseError
        let paramParseErrors
        let queryParseError
        let params, query
        try {
          params = match ? parseParams(match, paramParsers) : ({}: any)
        } catch (error) {
          paramParseError = error
          paramParseErrors = error.params
        }
        try {
          query = queryParser ? queryParser(location.search) : ({}: any)
        } catch (error) {
          queryParseError = error
        }

        if (paramParseError || queryParseError) {
          if (renderErrors)
            return convertUndefined(
              renderErrors({
                ...props,
                paramParseError,
                paramParseErrors,
                queryParseError,
              })
            )
          return null
        }

        if (!params) throw new Error('unexpected error: params is undefined')
        if (!query) throw new Error('unexpected error: query is undefined')

        const finalProps = {
          ...props,
          params,
          query,
        }

        if (component)
          return match ? React.createElement(component, finalProps) : null

        if (render) return match ? convertUndefined(render(finalProps)) : null

        if (typeof children === 'function')
          return convertUndefined(children(finalProps))

        if (children && !isEmptyChildren(children))
          return React.Children.only(children)

        return null
      }}
    </Route>
  )
}
