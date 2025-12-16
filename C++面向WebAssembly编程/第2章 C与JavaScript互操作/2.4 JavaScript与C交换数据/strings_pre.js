function Pointer_stringify(ptr) {
  var buffer = [];
  var i = 0;
  while (i < 50) {
    var charInt = Module.HEAPU8[ptr + i++];
    if (charInt != 0)
      buffer.push(charInt);
    else
      break;
  }
  
  var decoder = new TextDecoder();
  var str = decoder.decode(new Uint8Array(buffer));
  return str;
}

function allocateUTF8(str) {
  var encoder = new TextEncoder();
  var u8 = encoder.encode(str);
  var ptr = Module._malloc(u8.length);
  for(var i = 0; i < u8.length; i++) {
    Module.HEAPU8[ptr + i] = u8[i];
  }
  return ptr;
}

Module.onRuntimeInitialized = function() {
  var ptr = Module._get_string();
  var str = Pointer_stringify(ptr);
  console.log(typeof(str));
  console.log(str);
  
  ptr = allocateUTF8("你好，Emscripten！");
  Module._print_string(ptr);
  _free(ptr);
}