Module.onRuntimeInitialized = function() {
  var s = Module._Sum_New();
  console.log(Module._Sum_Inc(s, 29));
  Module._Sum_Delete(s);
}