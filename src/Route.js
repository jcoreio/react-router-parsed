// @flow

import * as React from 'react'
import { Route } from 'react-router'
import type {
  Match,
  ContextRouter,
  RouterHistory,
  Location,
} from 'react-router'

const isEmptyChildren = (children: any) => React.Children.count(children) === 0

export type ParamParsers<Params: { ... }> = $ObjMap<
  Params,
  <Param>(Param) => (string, $Keys<Params>, { match: Match }) => Param
>

export type ParamParseErrors<Params: { ... }> = $ObjMap<
  Params,
  <Param>(Param) => ?Error
>

export type QueryParser<Query: { ... }> = (search: string) => Query

declare type StaticRouterContext = { url?: string, ... }

export type RenderProps<Params: { ... }, Query: { ... }> = {|
  history: RouterHistory,
  location: Location,
  match: Match,
  staticContext?: StaticRouterContext,
  params: Params,
  query: Query,
|}

export type ChildrenProps<Params: { ... }, Query: { ... }> = {|
  history: RouterHistory,
  location: Location,
  match: Match | null,
  staticContext?: StaticRouterContext,
  params: Params,
  query: Query,
|}

export type ErrorProps<Params: { ... }> = {|
  history: RouterHistory,
  location: Location,
  match: Match | null,
  staticContext?: StaticRouterContext,
  paramParseError: ?Error,
  paramParseErrors: ?ParamParseErrors<Params>,
  queryParseError: ?Error,
|}

type BaseProps = React.ElementProps<typeof Route>

export type Props<Params: { ... }, Query: { ... }> = {|
  ...$Diff<
    BaseProps,
    {
      component: any,
      render: any,
      children: any,
    }
  >,
  paramParsers?: ParamParsers<Params>,
  queryParser?: QueryParser<Query>,
  component?: React.ComponentType<*>,
  render?: (props: RenderProps<Params, Query>) => ?React.Node,
  children?: React.ComponentType<ChildrenProps<Params, Query>> | ?React$Node,
  renderErrors?: (props: ErrorProps<Params>) => ?React.Node,
|}

export function parseParams<Params: {}>(
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

export default function ParsedRoute<Params: { ... }, Query: { ... }>({
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
      {(props: ContextRouter): React.Node | null => {
        const { match, location } = props
        let paramParseError
        let paramParseErrors
        let queryParseError
        let params: Params = ({}: any),
          query: Query = ({}: any)
        try {
          if (match) params = parseParams(match, paramParsers)
        } catch (error) {
          paramParseError = error
          paramParseErrors = error.params
        }
        try {
          if (queryParser) query = queryParser(location.search)
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
