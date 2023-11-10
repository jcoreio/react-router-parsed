import { History, Location, LocationState } from 'history'
import { StaticContext, match, RouteProps } from 'react-router'

export type ParamParsers<Params extends object> = {
  [K in keyof Params]-?: (
    value: string | undefined,
    key: K,
    props: { match: match }
  ) => Params[K]
}

export type ParamParseErrors<Params extends object> = {
  [K in keyof Params]-?: Error | null | undefined
}

export type QueryParser<Query extends object> = (search: string) => Query

export type RenderProps<
  Params extends object = {},
  Query extends object = {},
  C extends StaticContext = StaticContext,
  S = LocationState
> = {
  history: History<S>
  location: Location<S>
  match: match
  staticContext?: C
  params: Params
  query: Query
}

export type ChildrenProps<
  Params extends object = {},
  Query extends object = {},
  C extends StaticContext = StaticContext,
  S = LocationState
> = {
  history: History<S>
  location: Location<S>
  match: match | null
  staticContext?: C
  params: Params
  query: Query
}

export type ErrorProps<
  Params extends object = {},
  C extends StaticContext = StaticContext,
  S = LocationState
> = {
  history: History<S>
  location: Location<S>
  match: match | null
  staticContext?: C
  paramParseError: Error | null | undefined
  paramParseErrors: ParamParseErrors<Params> | null | undefined
  queryParseError: Error | null | undefined
}

export type Props<
  Params extends object = {},
  Query extends object = {},
  C extends StaticContext = StaticContext,
  S = LocationState
> = Omit<
  RouteProps<string, { [K in keyof Params]: string }>,
  'component' | 'render' | 'children'
> & {
  paramParsers?: ParamParsers<Params>
  queryParser?: QueryParser<Query>
  component?: React.ElementType
  render?: (
    props: RenderProps<Params, Query, C, S>
  ) => React.ReactElement | null | undefined
  children?:
    | React.ComponentType<ChildrenProps<Params, Query, C, S>>
    | React.ReactElement
    | null
  renderErrors?: (
    props: ErrorProps<Params, C, S>
  ) => React.ReactElement | null | undefined
}

export function parseParams<Params extends object = {}>(
  match: match,
  paramParsers: ParamParsers<Params> | null | undefined
): Params

export default function ParsedRoute<
  Params extends object = {},
  Query extends object = {},
  C extends StaticContext = StaticContext,
  S = LocationState
>(props: Props<Params, Query, C, S>): React.ReactElement
