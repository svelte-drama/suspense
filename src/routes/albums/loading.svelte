<svg class="circular" viewBox="0 0 100 100">
  <circle
    class="path"
    cx="50"
    cy="50"
    r="20"
    fill="none"
    stroke-width="4"
    stroke-miterlimit="10"
  />
</svg>

<style>
.circular {
  animation: rotate 2s linear infinite;
  height: 200px;
  left: calc(50vw - 100px);
  position: fixed;
  top: calc(50vh - 100px);
  width: 200px;
}
.path {
  animation: dash 1.5s ease-in-out infinite;
  stroke-linecap: round;
  stroke: #ccc;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
}
</style>
