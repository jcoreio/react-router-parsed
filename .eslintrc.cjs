/* eslint-env node, es2018 */
module.exports = {
  extends: [require.resolve('@jcoreio/toolchain/eslint.config.cjs')],
  env: {
    es2017: true,
  },
  rules: {
    '@typescript-eslint/ban-types': 0,
  },
}
