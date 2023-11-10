// @flow

import * as React from 'react'
import { MemoryRouter } from 'react-router'
import { describe, it } from 'mocha'
import { mount } from 'enzyme'
import { expect } from 'chai'
import sinon from 'sinon'
// $FlowFixMe
import qs from 'qs'
import Route from '../src/Route'
import useRouteMatch, {
  type MatchPathOptions,
  type UseRouteMatchResult,
} from '../src/useRouteMatch'

type UseRouteMatchProps<Params: { ... }, Query: { ... }> = {|
  ...MatchPathOptions<Params, Query>,
  render?: (props: UseRouteMatchResult<Params, Query>) => any,
|}

function UseRouteMatch<Params: { ... }, Query: { ... }>({
  render,
  ...props
}: UseRouteMatchProps<Params, Query>): null {
  const result = useRouteMatch(props)
  render?.(result)
  return null
}

describe('Route', () => {
  it("doesn't error when component, render, and children are missing", () => {
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/hello/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
        />
      </MemoryRouter>
    )
  })
  it("doesn't error when renderErrors is missing", () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: () => {
              throw new Error()
            },
            bar: (text) => text.split(/,/g),
          }}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.called).to.be.false
  })
  it("doesn't call render when it doesn't match", () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/hello/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.called).to.be.false
  })
  it("doesn't render component when it doesn't match", () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/hello/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
          component={render}
        />
      </MemoryRouter>
    )
    expect(render.called).to.be.false
  })
  it("calls children with null match when it doesn't match", () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/hello/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
        >
          {render}
        </Route>
      </MemoryRouter>
    )
    expect(render.args[0][0].match).to.be.null
  })
  it("doesn't error when children is not a function", () => {
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
        >
          <div>test</div>
        </Route>
      </MemoryRouter>
    )
  })
  it("doesn't error when children is empty", () => {
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
        />
      </MemoryRouter>
    )
  })
  it('calls paramParsers with correct args', () => {
    const parseFoo = sinon.spy((foo) => foo)
    const parseBar = sinon.spy((bar) => bar)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFoo,
            bar: parseBar,
          }}
        />
      </MemoryRouter>
    )
    const match = {
      path: '/:foo/:bar',
      url: '/3/hello,world',
      isExact: true,
      params: {
        foo: '3',
        bar: 'hello,world',
      },
    }
    expect(parseFoo.args[0]).to.deep.equal(['3', 'foo', { match }])
    expect(parseBar.args[0]).to.deep.equal(['hello,world', 'bar', { match }])
  })
  it('passes parsed params to render', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].params).to.deep.equal({
      foo: 3,
      bar: ['hello', 'world'],
    })
  })
  it('passes parsed params to component', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
          component={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].params).to.deep.equal({
      foo: 3,
      bar: ['hello', 'world'],
    })
  })
  it('passes parsed params to children', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
        >
          {render}
        </Route>
      </MemoryRouter>
    )
    expect(render.args[0][0].params).to.deep.equal({
      foo: 3,
      bar: ['hello', 'world'],
    })
  })
  it('calls renderErrors with param parse errors', () => {
    const render = sinon.spy(() => null)
    const error = new Error('Test!')
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <Route
          path="/:foo/:bar"
          paramParsers={{
            foo: () => {
              throw error
            },
            bar: (text) => text.split(/,/g),
          }}
          renderErrors={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].paramParseError).to.exist
    expect(render.args[0][0].paramParseErrors).to.deep.equal({
      foo: error,
    })
  })
  it('passes parsed query to render', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter
        initialEntries={[{ pathname: '/foo', search: '?foo=bar' }]}
        initialIndex={0}
      >
        <Route
          path="/foo"
          queryParser={(search) => qs.parse(search.substring(1))}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].query).to.deep.equal({ foo: 'bar' })
  })
  it('passes parsed query to component', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter
        initialEntries={[{ pathname: '/foo', search: '?foo=bar' }]}
        initialIndex={0}
      >
        <Route
          path="/foo"
          queryParser={(search) => qs.parse(search.substring(1))}
          component={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].query).to.deep.equal({ foo: 'bar' })
  })
  it('passes parsed query to children', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter
        initialEntries={[{ pathname: '/foo', search: '?foo=bar' }]}
        initialIndex={0}
      >
        <Route
          path="/foo"
          queryParser={(search) => qs.parse(search.substring(1))}
        >
          {render}
        </Route>
      </MemoryRouter>
    )
    expect(render.args[0][0].query).to.deep.equal({ foo: 'bar' })
  })
  it('calls renderErrors with query parse error', () => {
    const render = sinon.spy(() => null)
    const error = new Error('test')
    mount(
      <MemoryRouter
        initialEntries={[{ pathname: '/foo', search: '?foo=bar' }]}
        initialIndex={0}
      >
        <Route
          path="/foo"
          queryParser={() => {
            throw error
          }}
          renderErrors={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].queryParseError).to.equal(error)
  })
})
describe('UseRouteMatch', () => {
  it("passes match: null when path doesn't match", () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <UseRouteMatch
          path="/hello/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0]).to.containSubset({
      match: null,
      params: {},
      query: {},
    })
  })
  it('calls paramParsers with correct args', () => {
    const parseFoo = sinon.spy((foo) => foo)
    const parseBar = sinon.spy((bar) => bar)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <UseRouteMatch
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFoo,
            bar: parseBar,
          }}
        />
      </MemoryRouter>
    )
    const match = {
      path: '/:foo/:bar',
      url: '/3/hello,world',
      isExact: true,
      params: {
        foo: '3',
        bar: 'hello,world',
      },
    }
    expect(parseFoo.args[0]).to.deep.equal(['3', 'foo', { match }])
    expect(parseBar.args[0]).to.deep.equal(['hello,world', 'bar', { match }])
  })
  it('returns parsed params', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <UseRouteMatch
          path="/:foo/:bar"
          paramParsers={{
            foo: parseFloat,
            bar: (text) => text.split(/,/g),
          }}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].params).to.deep.equal({
      foo: 3,
      bar: ['hello', 'world'],
    })
  })
  it('returns errors', () => {
    const render = sinon.spy(() => null)
    const error = new Error('Test!')
    mount(
      <MemoryRouter initialEntries={['/3/hello,world']} initialIndex={0}>
        <UseRouteMatch
          path="/:foo/:bar"
          paramParsers={{
            foo: () => {
              throw error
            },
            bar: (text) => text.split(/,/g),
          }}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].error).to.exist
    expect(render.args[0][0].paramParseError).to.exist
    expect(render.args[0][0].paramParseErrors).to.deep.equal({
      foo: error,
    })
  })
  it('returns parsed query', () => {
    const render = sinon.spy(() => null)
    mount(
      <MemoryRouter
        initialEntries={[{ pathname: '/foo', search: '?foo=bar' }]}
        initialIndex={0}
      >
        <UseRouteMatch
          path="/foo"
          queryParser={(search) => qs.parse(search.substring(1))}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].query).to.deep.equal({ foo: 'bar' })
  })
  it('returns query parse error', () => {
    const render = sinon.spy(() => null)
    const error = new Error('test')
    mount(
      <MemoryRouter
        initialEntries={[{ pathname: '/foo', search: '?foo=bar' }]}
        initialIndex={0}
      >
        <UseRouteMatch
          path="/foo"
          queryParser={() => {
            throw error
          }}
          render={render}
        />
      </MemoryRouter>
    )
    expect(render.args[0][0].queryParseError).to.equal(error)
  })
})
