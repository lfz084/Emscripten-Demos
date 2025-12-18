function Pointer_stringify(ptr) {
  var buffer = [];
  var i = 0;
  while (i < 1024) {
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

Module.print = s => alert(s);