const path = require('path')

module.exports = {
  workspaceRoot: path.resolve('..'),
  mount: {
    "src": "/"
  },
  plugins: [
    '@snowpack/plugin-svelte'
  ],
}
