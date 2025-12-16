Module.onRuntimeInitialized = function() {
  console.log(Object.keys(Module));
  var count = 50;
  var ptr = Module._malloc(4 * count);
  for (var i = 0; i < count; i++) {
    Module.HEAP32[ptr / 4 + i] = i + 1;
  }
  console.log(Module._sum(ptr, count));
  Module._free(ptr);
}