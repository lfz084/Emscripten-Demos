function createMemory(size) {
  try {
    return new WebAssembly.Memory({
      "initial": size / 65536,
      // In theory we should not need to emit the maximum if we want "unlimited"
      // or 4GB of memory, but VMs error on that atm, see
      // https://github.com/emscripten-core/emscripten/issues/14130
      // And in the pthreads case we definitely need to emit a maximum. So
      // always emit one.
      "maximum": 65536
    });
  }catch(e) {}
}

function CreateMaxMemory() {
  var memory_size_array = [
    0x100000000 - 65536,
    // 4GB
    0xE0000000,
    // 3.5GB
    0xC0000000,
    // 3GB
    0xA0000000,
    // 2.5GB
    0x80000000,
    // 2GB
    0x60000000,
    // 1.5GB
    0x40000000,
    // 1GB
    0x38000000,
    // 896MB
    0x30000000,
    // 768MB
    0x28000000,
    // 640MB
    0x20000000,
    // 512MB
    0x10000000,
    // 256MB
    0x8000000,
    // 128MB
  ];
  while (memory_size_array.length) {
    var wasmMemory = createMemory(memory_size_array.shift());
    wasmMemory && console.log("wasmMemory.buffer.byteLength = " + wasmMemory.buffer.byteLength);
    if (wasmMemory) return wasmMemory;
  }
}

var Module = {
  wasmMemory: CreateMaxMemory()
}