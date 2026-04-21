importScripts("./JSFile.js", "./LocalFile.js");

const lcFile = new LocalFile();

async function open(...args) {
  return lcFile.open(...args);
}

async function close(...args) {
  return lcFile.close(...args);
}

async function read(...args) {
  const buffer = args[0].buffer || args[0];
  const byteOffset = args[0].byteOffset || 0;
  const thisProgressFunc = getProgressFunction("read");
  const bytes = await lcFile.read(...args);
  thisProgressFunc(new DataView(buffer, byteOffset, byteOffset + bytes))
  return bytes;
}

async function write(...args) {
  const buffer = args[0].buffer || args[0];
  const byteOffset = args[0].byteOffset || 0;
  const byteLength = args[0].byteLength;
  console.log(new Uint8Array(buffer, byteOffset, byteOffset + byteLength))
  return lcFile.write(...args);
}

async function flush(...args) {
  return lcFile.flush();
}