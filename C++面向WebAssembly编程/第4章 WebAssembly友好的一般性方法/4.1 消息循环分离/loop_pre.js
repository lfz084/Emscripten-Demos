function step_run() {
  Module._step();
  window.requestAnimationFrame(step_run);
}

Module.onRuntimeInitialized = function() {
  window.requestAnimationFrame(step_run);
}