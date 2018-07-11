# react-router-parsed

[![Build Status](https://travis-ci.org/jcoreio/react-router-parsed.svg?branch=master)](https://travis-ci.org/jcoreio/react-router-parsed)
[![Coverage Status](https://codecov.io/gh/jcoreio/react-router-parsed/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/react-router-parsed)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This package provides a <Route> wrapper to handle url parameter and querystring
parsing and error handling in an organized fashion.

## Quick Start

```sh
npm install --save react-router react-router-parsed
```
```js
import Route from 'react-router-parsed/Route'
```

### Parsing URL parameters

If you need to parse any url parameters, add a `paramParsers` property and
consume the `params` prop in your route `component`, `render` function, or
`children`:
```js
import Route from 'react-router-parsed/Route'

const EditUserRoute = () => (
  <Route
    path="/users/:userId"
    paramParsers={{userId: parseInt}}
    render={({params: {userId}, ...props}) => (
      <EditUserView {...props} userId={userId} />
    )}
  />
)
```

For each property in `paramParsers`, the key is the url parameter name, and the
value is a function that takes the raw string value for the url parameter and
returns the parsed value.

### Parsing `location.search`

If you need to parse `location.search`, add a `queryParser` property and
consume the `query` prop in your route `component`, `render` function, or
`children`:
```js
import qs from 'qs'
import Route from 'react-router-parsed/Route'

const EditUserRoute = () => (
  <Route
    path="/"
    queryParser={search => qs.parse(search.substring(1))}
    render={({query: {showMenu}, ...props}) => (
      <App {...props} showMenu={showMenu} />
    )}
  />
)
```

### Error handling

If any of your parsers throws errors, they will be collected and passed to an
(optional) `renderErrors` function:

```js
import Route from 'react-router-parsed/Route'

const EditUserRoute = () => (
  <Route
    path="/users/:userId"
    paramParsers={{
      userId: (userId) => {
        const result = parseInt(userId)
        if (!userId || !userId.trim() || !Number.isFinite(result)) {
          throw new Error(`invalid userId: ${userId}`)
        }
        return result
      }
    }}
    render={({params: {userId}, ...props}) => (
      <EditUserView {...props} userId={userId} />
    )}
    renderErrors={({paramParseErrors}) => (
      <div className="alert alert-danger">
        Invalid URL: {paramParseErrors.userId}
      </div>
    )}
  />
)
```

`renderErrors` will be called with the same props as `render`, plus:
* `paramParseError` - a compound `Error` from parsing params, if any
* `paramParseErrors` - an object with `Error`s thrown by the corresponding
  `paramParsers`
* `queryParseError` - the `Error` from `queryParser`, if any
