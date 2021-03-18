<script>
import { getResource } from './api.js'
import Spinner from './spinner.svelte'

const friend = getResource().friend()
</script>

<header>
  <a href="https://svelte.dev/">
    <img class="logo" alt="Made with Svelte" src="https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg" />
  </a>

  <div class="menu">
    {#await friend}
      <Spinner stroke="white" />
      Loading menu...
    {:then friend}
      { friend.name }
    {/await}
  </div>
</header>

<style>
header {
  align-items: center;
  background-color: #2d3748;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%), 0 10px 10px -5px rgb(0 0 0 / 4%);
  color: rgba(226, 232, 240);
  display: flex;
  justify-content: space-between;
  padding: .5em 3rem;
}
.logo {
  height: 2.5em;
  width: 2.5em;
}
.menu {
  text-align: right;
}
</style>
