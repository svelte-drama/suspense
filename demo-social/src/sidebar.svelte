<script>
import { Suspense } from '@jamcart/suspense'
import Friends from './friends.svelte'
</script>

<nav>
  <Suspense>
    <h1>Navigation</h1>
  
    <section>
      <h2>Main</h2>
      <ul>
        <li>Home</li>
        <li>About</li>
      </ul>  
    </section>
  
    <section>
      <h2>Friends</h2>
      <Friends />
    </section>
  
    <section>
      <h2>Events</h2>
      <ul>
        <li>Create new</li>
        <li>View current</li>
      </ul>
    </section>
  </Suspense>  
</nav>

<style>
nav :global(ul) {
  list-style: none;
  margin: 0;
  padding: 0;
}
h1 {
  left: -1000em;
  position: absolute;
}
h2 {
  font-size: 100%;
  font-weight: bold;
  margin: 0;
}
section {
  margin: 0 -.5em;
  padding: 0 .5em;
}
section + section {
  border-top: 1px solid #e2e8f0;
  margin-top: .5em;
  padding-top: .5em;
}
</style>
