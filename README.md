# react-router-parsed

[![CircleCI](https://circleci.com/gh/jcoreio/react-router-parsed.svg?style=svg)](https://circleci.com/gh/jcoreio/react-router-parsed)
[![Coverage Status](https://codecov.io/gh/jedwards1211/react-library-skeleton/branch/master/graph/badge.svg)](https://codecov.io/gh/jedwards1211/react-library-skeleton)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/react-library-skeleton.svg)](https://badge.fury.io/js/react-library-skeleton)

This package provides a <Route> wrapper to handle url parameter and querystring
parsing and error handling in an organized fashion.

## Rationale

After working with `react-router` 4 enough, I started to realize that I had a lot of duplicated code to parse my
URL params and query string within render methods and event handlers for my components. For instance:

```js
class EditDeviceView extends React.Component {
  render() {
    const {match: {params}} = this.props
    const organizationId = parseInt(params.organizationId)
    const deviceId = parseInt(params.deviceId)

    return (
      <Query variables={{organizationId, deviceId}}>
        {({loading, data}) => (
          <form onSubmit={this.handleSubmit}>
            ...
          </form>
        )}
      </Query>
    )
  }
  handleSubmit = () => {
    // duplicated code:
    const {match: {params}} = this.props
    const organizationId = parseInt(params.organizationId)
    const deviceId = parseInt(params.deviceId)

    ...
  }
}
```

After awhile, I had had enough of this. While I could have moved the parsing logic to a function in the same file,
I realized everything would be easier if I parse the params and query outside of my component and pass in the
already-parsed values as props.

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
    paramParsers={{ userId: parseInt }}
    render={({ params: { userId }, ...props }) => (
      <EditUserView {...props} userId={userId} />
    )}
  />
)
```

For each property in `paramParsers`, the key is the url parameter name, and the
value is a function that takes the following arguments and returns the parsed
value.

- `raw` - the raw string value of the parameter
- `param` - the key, or parameter name
- `info` - a hash of additional info; right now, just `{match}`

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
    queryParser={(search) => qs.parse(search.substring(1))}
    render={({ query: { showMenu }, ...props }) => (
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
      },
    }}
    render={({ params: { userId }, ...props }) => (
      <EditUserView {...props} userId={userId} />
    )}
    renderErrors={({ paramParseErrors }) => (
      <div className="alert alert-danger">
        Invalid URL: {paramParseErrors.userId}
      </div>
    )}
  />
)
```

`renderErrors` will be called with the same props as `render`, plus:

- `paramParseError` - a compound `Error` from parsing params, if any
- `paramParseErrors` - an object with `Error`s thrown by the corresponding
  `paramParsers`
- `queryParseError` - the `Error` from `queryParser`, if any
