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

//xhr_wrap2.html
function JS_XHRGet(url, cb) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "text";
  request.url = url;
  request.wrap_cb = cb;
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200) {
        Module.ccall('XHROnMessage', 'null',
          ['string', 'string', 'number'],
          [request.url, request.responseText, request.wrap_cb]);
      } else {
        Module.ccall('XHROnError', 'null',
          ['string', 'number', 'number'],
          [request.url, request.status, request.wrap_cb]);
      }
    }
  };
  request.send();
}