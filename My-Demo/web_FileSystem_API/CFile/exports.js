importScripts("./JSFile.js", "./LocalFile.js", "./FileSystem.js");

var Module = {
  onRuntimeInitialized: function() {
    console.log("Module:")
    console.log(Object.keys(Module))
    console.log("WASM Ready")
  },
  printError: function(e) {
    console.error(e.stack || e.message || e.toString())
  },
  FileSystem
};

console.log("load WASM")
importScripts("./CFile-Demo.js");

//------------- exports -------------------------

async function openFilePicker() {
  return FileSystem.openFilePicker();
}

async function open(path, mode) {
  const str_buf = Module.get_str_buffer();
  const str_buf_size = Module.get_str_buffer_size();
  stringToUTF8(path, str_buf, str_buf_size);
  return Module.open(str_buf, mode);
}

async function close() {
  return Module.close();
}

async function flush() {
  return Module.flush();
}

async function getSize() {
  return Module.getSize();
}

async function truncate(size) {
  return Module.truncate(size);
}

async function seek(offset) {
  return Module.seek(offset);
}

async function read() {
  const buffer = Module.get_data_buffer();
  const buffer_size = Module.get_data_buffer_size();
  const bytes = await Module.read(buffer, buffer_size);
  console.log(bytes + "bytes: " + new Uint8Array(Module.wasmMemory.buffer, buffer, bytes));
}

async function write() {
  const buffer = Module.get_data_buffer();
  // const buffer_size = Module.get_data_buffer_size();
  const writeSize = 8;
  const u8 = new Uint8Array(Module.wasmMemory.buffer, buffer, writeSize);
  [1,2,3,4,5,6,7,8,9,0].map((v,i) => u8[i] = v);
  const bytes = await Module.write(buffer, writeSize);
  console.log(bytes + "bytes: " + u8);
}

const writeText = "在针对 WebAssembly 时，Module.instantiateWasm 是一个可选的用户实现的回调函数，Emscripten 运行时会调用它来执行 WebAssembly 实例化操作。回调函数将被调用，带有两个参数，imports 和 successCallback。 imports 是一个 JS 对象，包含实例化时需要传递给 WebAssembly 模块的所有函数导入，并且一旦实例化，此回调函数应使用生成的 WebAssembly 实例对象调用 successCallback()。实例化可以同步或异步执行。此函数的返回值应包含实例化的 WebAssembly 模块的 exports 对象，或者如果实例化是异步执行的，则包含一个空字典对象 {}，或者如果实例化失败，则包含 false。通过此函数覆盖 WebAssembly 实例化过程在您有其他自定义异步启动操作或下载（可以与 WebAssembly 编译并行执行）时非常有用。实现此回调允许并行执行所有这些操作。有关此结构如何在实践中工作的示例，请参见文件 test/manual_wasm_instantiate.html 和测试";

async function testWrite(path) {
  const encoder = new TextEncoder();
  const maxWriteSize = 8;
  const writeTextDataU8 = encoder.encode(writeText);
  const pBuffer = Module.get_data_buffer();
  
  await close();
  await open(path, 2);
  await truncate(0);
  let index = 0;
  console.log("write test:")
  while (index < writeTextDataU8.length) {
    const writeSize = Math.min(maxWriteSize, writeTextDataU8.length - index);
    const u8 = new Uint8Array(writeTextDataU8.buffer, index, writeSize);
    const dvU8 = new Uint8Array(Module.wasmMemory.buffer, pBuffer, writeSize);
    u8.map((v, i) => dvU8[i] = u8[i]);
    const bytes = await Module.write(pBuffer, writeSize);
    index = index + writeSize;
    console.log(dvU8);
    console.log(bytes, index);
  }
  console.log("close file");
  await close();
  return writeTextDataU8;
}

async function testRead(path) {
  const decoder = new TextDecoder();
  const maxReadSize = 16;
  const dataArr = [];
  const pBuffer = Module.get_data_buffer();
  
  await close();
  await open(path, 1)
  let bytes = 0;
  console.log("read test");
  do {
    bytes = await Module.read(pBuffer, maxReadSize);
    const u8 = new Uint8Array(Module.wasmMemory.buffer, pBuffer, bytes);
    dataArr.push(...u8);
    console.log(u8);
    console.log(bytes);
  } while (bytes > 0)
  console.log("close file");
  await close();
  const readTextDataU8 = new Uint8Array(dataArr);
  return readTextDataU8;
}

async function testWriteRead(path) {
  const writeTextDataU8 = await testWrite(path);
  const readTextDataU8 = await testRead(path);
  const comp = function(a, b) {
    return a.length === b.length && !a.map((v,i)=>a[i]!==b[i]).filter(v=>v).length;
  }
  console.log("testWriteRead: " + comp(readTextDataU8, writeTextDataU8));
}