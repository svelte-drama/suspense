import path from 'path'
import svelte from '@svitejs/vite-plugin-svelte'

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  root: './src',
  build: {
    emptyOutDir: true,
    outDir: path.resolve('./public')
  },
  plugins: [svelte()]
}

export default config
