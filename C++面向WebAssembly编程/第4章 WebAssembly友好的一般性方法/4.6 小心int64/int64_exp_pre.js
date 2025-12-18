Module.onRuntimeInitialized = function() {
  console.log("Module._i64_add_lh()");
  console.log(Module._i64_add_lh(0xFFFFFFFE, 0x7FFFFFFF, 1, 0));
  console.log("Module._i64_add()");
  console.log(Module._i64_add(BigInt(0x7FFFFFFFFFFFFFFE), BigInt(1)));
}