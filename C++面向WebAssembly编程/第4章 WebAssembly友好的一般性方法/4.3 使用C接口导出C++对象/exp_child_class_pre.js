//exp_child_class.html
Module.onRuntimeInitialized = function() {
  var t = Module._Shape_New_Triangle();
  Module._Shape_WhatAreYou(t);

  var c = Module._Shape_New_Circle();
  Module._Shape_WhatAreYou(c);

  Module._Shape_Delete(t);
  Module._Shape_Delete(c);
}