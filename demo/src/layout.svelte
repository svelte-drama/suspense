<script>
  let refresh = 0
  </script>
  
  <header>
    <h1>Top 100 Albums from iTunes</h1>
    <button type="button" on:click={ () => refresh++ }>
      Reload
    </button>
  </header>
  
  {#key refresh}
    <slot></slot>
  {/key}
  
  <style>
  button {
    background: none !important;
    border: none !important;
    color: inherit;
    cursor: pointer;
    margin: 0;
    padding: 1em;
    text-decoration: underline;
  }
  header {
    align-items: center;
    background: black;
    color: white;
    display: flex;
    justify-content: space-between;
  }
  h1 {
    margin: 0;
    padding: .5em;
  }
  </style>
  