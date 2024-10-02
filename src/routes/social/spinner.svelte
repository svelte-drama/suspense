<script>
/** @type {{stroke?: string}} */
let { stroke = '#74a8d0' } = $props()
</script>

<svg class="spinner" viewBox="0 0 50 50">
  <circle class="path" cx="25" cy="25" r="20" {stroke} />
</svg>

<style>
.spinner {
  animation: rotate 2s linear infinite;
  height: 0.7em;
  vertical-align: baseline;
  width: 0.7em;
}
.path {
  animation: dash 1.5s ease-in-out infinite;
  fill: none;
  stroke-linecap: round;
  stroke-width: 10;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
