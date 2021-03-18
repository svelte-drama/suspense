import svelte from '@svitejs/vite-plugin-svelte'

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  root: './src',
  plugins: [svelte()]
}

export default config
