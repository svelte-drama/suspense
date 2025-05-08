# Suspense for Svelte

This is a Svelte component that implements the core idea of React's `<Suspense>`.

When requesting asynchronous data, a typical pattern is for a parent component to handle all fetching and then push data down to its children. This can become difficult as levels of nesting increase and add unnessecary amounts of complexity. `<Suspense>` instead lets its children, at an arbitrary nested depth, dictate when they are done loading.

[See it in action](https://svelte.dev/repl/91183af6db654f2099806426ff3bbb4b)

## Installation

```
npm install --save @svelte-drama/suspense
```

## `suspend`

Child components need to register what data they depend on. `suspend` returns a function to to handle orchestration between this component and its nearest parent `<Suspense>` component.

```js
suspend<T extends Promise<any>>(data: T) => T
```

Wrap a promise. This returns a promise, allowing it to be used as part of a promise chain. The containing `<Suspense>` component will display its `loading` state until the promise is resolved. If the promise is rejected, it will instead show the `error` state.

```js
suspend<T extends any | undefined>(data: T) => T
```

Wrap a model using runes. `<Suspense>` will consider this resolved as long as `data` resolves to not `undefined`. This call should be contained within `$effect` or `$derived` in order to update as the underlying data updates.

## `<Suspense>`

`<Suspense>` extends `<svelte:boundary>` with a few additional properties:

- _loading_: If there any pending requests, this slot will be displayed.
- _onload_: Triggers when all components inside the `<Suspense>` block have finished loading.

```svelte
<script>
import { createSuspense, Suspense } from '@svelte-drama/suspense'

const suspend = createSuspense()

const MyComponent = import('./my-component.svelte').then((m) => m.default)
</script>

<Suspense
  onerror={(e) => console.error(e)}
  onload={() => console.log('loaded')}
>
  {#snippet loading()}
    <p>Loading...</p>
  {/snippet}
  {#snippet failed(error, reset)}
    <p>Error: {error?.message || error}</p>
    <p>
      <button type="button" onclick={reset}> Try Again </button>
    </p>
  {/snippet}

  {#snippet children(suspend)}
    <h1>My Component</h1>
    {#await suspend(MyComponent) then MyComponent}
      <MyComponent />
    {/await}
  {/snippet}
</Suspense>
```

## `<SuspenseList>`

`<SuspenseList>` orchestrates the loading of all child `<Suspense>` containers. It guarantees they will load in display order. This is useful to avoid multiple, distracting pop-ins of content or reflow of elements while the user is reading.

- _collapse_: Boolean. Defaults to `false`. If `true`, only one loading state will be shown among the children.
- _final_: Boolean. Defaults to `false`. If `true`, children will not resuspend if they have been displayed, regardless of the state of previous siblings.
- _onload_: Triggers when all components inside the `<SuspenseList>` have finished loading.

```svelte
<script>
import { Suspense, SuspenseList } from '@svelte-drama/suspense'
import Loading from './loading.svelte'
import Post from './my-component.svelte'

export let posts
</script>

<SuspenseList collapse final>
  {#snippet children(loading)}
    {#if loading}
      <p>Fetching posts...</p>
    {/if}

    {#each posts as post}
      <Suspense>
        <Post {post} />

        {#snippet loading()}
          <Loading />
        {/snippet}
      </Suspense>
    {/each}
  {/snippet}
</SuspenseList>
```

## Limitations

- [Intro transitions](https://svelte.dev/docs/svelte-transition) will not work as expected on elements inside the default slot. Elements are rendered in a hidden container as soon as possible, which triggers these intro transitions prematurely.
- SSR will only display the loading component. Implementing `<Suspense>` during SSR would require Svelte to support `async/await` during SSR.
