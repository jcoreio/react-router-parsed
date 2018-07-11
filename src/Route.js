// @flow

import * as React from 'react'
import Route from 'react-router/Route'
import type {Match, Location, RouterHistory} from 'react-router'

const isEmptyChildren = children => React.Children.count(children) === 0

export type ParamParsers<Params: Object> =
  $ObjMap<Params, <Param>(Param) => (string) => Param>

export type ParamParseErrors<Params: Object> =
  $ObjMap<Params, <Param>(Param) => ?Error>

export type QueryParser<Query: Object> = (search: string) => Query

type BaseRenderProps = {
  match: Match,
  location: Location,
  history: RouterHistory,
}

export type RenderProps<Params: Object, Query: Object> = {
  match: Match,
  location: Location,
  history: RouterHistory,
  params: Params,
  query: Query,
}

export type ChildrenProps<Params: Object, Query: Object> = {
  match: ?Match,
  location: Location,
  history: RouterHistory,
  params: Params,
  query: Query,
}

export type ErrorProps<Params: Object> = {
  match: ?Match,
  location: Location,
  history: RouterHistory,
  paramParseError: ?Error,
  paramParseErrors: ?ParamParseErrors<Params>,
  queryParseError: ?Error,
}

type BaseProps = React.ElementProps<typeof Route>

export type Props<Params: Object, Query: Object> = $Diff<BaseProps, {
  component: any,
  render: any,
  children: any,
}> & {
  paramParsers?: ?ParamParsers<Params>,
  queryParser?: ?QueryParser<Query>,
  component?: ?React.ComponentType<*>,
  render?: ?(props: RenderProps<Params, Query>) => ?React.Node,
  children?: React.ComponentType<ChildrenProps<Params, Query>> | React.Element<*>,
  renderErrors?: ?(props: ErrorProps<Params>) => ?React.Node,
}

function parseParams<Params: Object>(match: Match, paramParsers: ?ParamParsers<Params>): Params {
  const params = {}
  if (!paramParsers) return (params: any)

  let hasErrors = false
  const errors = {}
  for (let param in paramParsers) {
    try {
      params[param] = paramParsers[param](match.params[param])
    } catch (error) {
      hasErrors = true
      errors[param] = error
    }
  }
  if (hasErrors) {
    const error = new Error('Some params failed to parse');
    (error: any).params = errors
    throw error
  }
  return (params: any)
}

export default function ParsedRoute<Params: Object, Query: Object>({
  component, render, children, paramParsers, queryParser, renderErrors, ...props
}: Props<Params, Query>): React.Node {
  return (
    <Route {...props}>
      {(props: BaseRenderProps) => {
        const {match, location} = props
        let paramParseError
        let paramParseErrors
        let queryParseError
        let params, query
        try {
          params = match ? parseParams(match, paramParsers) : {}
        } catch (error) {
          paramParseError = error
          paramParseErrors = error.params
        }
        try {
          query = queryParser ? queryParser(location.search) : {}
        } catch (error) {
          queryParseError = error
        }

        if (paramParseError || queryParseError) {
          if (renderErrors) return renderErrors({
            ...props,
            paramParseError,
            paramParseErrors,
            queryParseError,
          })
          return null
        }

        const finalProps = {
          ...props,
          params,
          query
        }

        if (component) return match ? React.createElement(component, finalProps) : null

        if (render) return match ? render(finalProps) : null

        if (typeof children === "function") return children(finalProps)

        if (children && !isEmptyChildren(children))
          return React.Children.only(children)

        return null
      }}
    </Route>
  )
}
