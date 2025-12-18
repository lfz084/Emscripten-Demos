//ref_count.html
Module = {};
var g_t = 0;
Module.onRuntimeInitialized = function() {
  var t = Module._Shape_Create_Triangle();
  Module._Shape_WhatAreYou(t);

  Module._CObj_AddRef(t);
  g_t = t;

  Module._CObj_Release(t);
  t = 0;

  setTimeout(() => {
    Module._CObj_Release(g_t);
    g_t = 0;
  }, 2000);
}