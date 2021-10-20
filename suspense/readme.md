# Suspense for Svelte

This is a Svelte component that implements the core idea of React's `<Suspense>`.

When requesting asynchronous data, a typical pattern is for a parent component to handle all fetching and then push data down to its children.  This can become difficult as levels of nesting increase and add unnessecary amounts of complexity.  `<Suspense>` instead lets its children, at an arbitrary nested depth, dictate when they are done loading.

[See it in action](https://svelte.dev/repl/68f214326ffd40848272422836caa1f5?version=3.35.0)


## `createSuspense`

Child components need to register what data they depend on.  `createSuspense` returns a function to to handle orchestration between this component and its nearest descendant `<Suspense>` component.

Because it relies on [getContext](https://svelte.dev/docs#getContext), this must be declared during component initialization.

```js
import { createSuspense } from '@jamcart/suspense'
const suspend = createSuspense()
```

The resulting function, `suspend`, can be used in two different ways.

### suspend(promise) => promise

Register a promise.  This returns a promise, allowing it to be used as part of a promise chain.

### suspend() => { resolve, reject }

Delays loading under either `resolve`, indicating success, or `reject`, throwing `<Suspense>` to its error state, is called.

### Example

This example causes the parent `<Suspense>` container to display loading until *all* images have finished loading.

```html
// my-component.svelte
<script>
import { createSuspense } from '@jamcart/suspense'
const suspend = createSuspense()

const request = fetch('/my-api').then(response => response.json())
</script>

{#await suspend(request) then data}
  <ul>
    {#each data as item}
      <li>
        <img on:load={ suspend().resolve } alt={ item.title } src={ item.src } />
      </li>
    {/each}
  </ul>
{/await}
```

## `<Suspense>`

`<Suspense>` provides three slots, only one of which will be displayed at a time.  All three are optional.

- *loading*: If there any pending requests, this slot will be displayed.
- *error*: Once any request fails, this slot is displayed.  The error is assumed to be unrecoverable and this instance will no longer update its status.  The caught error is [passed to the slot](https://svelte.dev/docs#slot_let) as `error`. 
- *default*: After all children have finished loading data, display this.

Two events are availabe:
- *on:error*: Triggers after any promise given to `suspend` is rejected.  The original error is passed as part of `event.detail`.
- *on:load*:  Triggers after the first time the components inside the `<Suspense>` block finish loading.

```html
<script>
import { Suspense } from '@jamcart/suspense'
const MyComponent = import('./my-component.svelte').then(m => m.default)
</script>

<Suspense let:suspend on:error={ e => console.error(e.details) } on:load={ () => console.log("loaded") }>
  <p slot="loading">Loading...</p>
  <p slot="error" let:error>Error: { error?.message || error }</p>

  <h1>My Component</h1>
  {#await suspend(MyComponent) then MyComponent}
    <MyComponent />
  {/await}
</Suspense>
```

## `<SuspenseList>`

`<SuspenseList>` orchestrates the loading of all child `<Suspense>` containers.  It guarantees they will load in display order.  This is useful to avoid multiple, distracting pop-ins of content or reflow of elements while the user is reading.

- *collapse*: Boolean, defaults to `false`.  If `true`, only one loading state will be shown among the children.

```html
<script>
import { Suspense, SuspenseList } from '@jamcart/suspense'
import Loading from './loading.svelte'
import Post from './my-component.svelte'

export let posts
</script>

<SuspenseList>
  {#each posts as post}
    <Suspense>
      <Loading slot="loading" />

      <Post { post } />
    </Suspense>
  {/each}
</SuspenseList>
```

## Limitations

* [Intro transitions](https://svelte.dev/docs#transition_fn) will not work as expected on elements inside the default slot.  Elements are rendered in a hidden container as soon as possible, which triggers these intro transitions prematurely.
* SSR will display a blank component.  `<Suspense>` components are initialized as empty initially to avoid flahses of content as the underlying promises regiser and resolve.
* `createSuspense` operates at component boundaries.  The following example causes the parent of "my-component.svelte" to suspend, not the `<Suspense>` block inside of it, despite initial appearances:

```html
<script>
  import getData from './get-data.js'
  import Suspense, { createSuspense } from '@jamcart/suspense'
  const suspend = createSuspense()
  const request = getData()
</script>

<Suspense>
  {#await suspend(request) then data}
    { JSON.stringify(data) }
  {/await}
</Suspense>
```

This, however, will work as it looks:

```html
<script>
  import getData from './get-data.js'
  import Suspense from '@jamcart/suspense'
  const request = getData()
</script>

<Suspense let:suspend>
  {#await suspend(request) then data}
    { JSON.stringify(data) }
  {/await}
</Suspense>
```
