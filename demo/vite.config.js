import { svelte } from '@sveltejs/vite-plugin-svelte'

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  root: './src',
  plugins: [svelte()]
}

export default config
