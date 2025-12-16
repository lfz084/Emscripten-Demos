Module.onRuntimeInitialized = function() {
  // ccall
  console.log("using ccall: ");
  
  var result = Module.ccall('add', 'number', ['number', 'number'], [25.0, 41]);
  console.log(result);
  
  var str = 'The answer is:42';
	Module.ccall('print_string', 'null', ['string'], [str]);
	
	var count = 50;
	var buf = new ArrayBuffer(count * 4);
	var i8 = new Uint8Array(buf);
	var i32 = new Int32Array(buf);
	for (var i = 0; i < count; i++){
		i32[i] = i + 1;
	}
	result = Module.ccall('sum', 'number', ['array', 'number'], [i8, count]);
	console.log(result);
  
	console.log(Module.ccall('get_string', 'string'));
	
	// cwrap
	console.log("using cwrap: ");
	
	var c_add = Module.cwrap('add', 'number', ['number', 'number']);
	var c_print_string = Module.cwrap('print_string', 'null', ['string']);
	var c_sum = Module.cwrap('sum', 'number', ['array', 'number']);
	var c_get_string = Module.cwrap('get_string', 'string');
	
  console.log(c_add(25.0, 41));
	c_print_string(str);
	console.log(c_get_string());
	console.log(c_sum(i8, count));
}