/* eslint-env node, es2018 */
module.exports = function (api) {
  const base = require('@jcoreio/toolchain-esnext/.babelrc.cjs')(api)
  return {
    ...base,
    plugins: base.plugins.filter(
      (p) => !/babel-plugin-flow-react-proptypes/.test(p)
    ),
  }
}
