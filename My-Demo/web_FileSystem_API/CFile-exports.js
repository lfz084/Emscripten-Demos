importScripts("./JSFile.js", "./LocalFile.js", "./FileSystem.js", "./CFile.js");

const cFile = new CFile(FileSystem.addFile());

async function openFilePicker(...args) {
  return FileSystem.openFilePicker(...args)
}

async function saveFilePicker(...args) {
  return FileSystem.saveFilePicker(...args)
}

async function open(...args) {
  return cFile.open(...args)
}

async function close(...args) {
  return cFile.close(...args)
}

async function getSize(...args) {
  return cFile.getSize(...args)
}

async function truncate(...args) {
  return cFile.truncate(...args)
}

async function seek(...args) {
  return cFile.seek(...args)
}

async function read(...args) {
  const buffer = new ArrayBuffer(10);
  const bytes = await cFile.read(buffer);
  console.log("read: " + new Uint8Array(buffer, 0, bytes));
  console.log("bytes: " + bytes)
}

async function write(...args) {
  const u8 = new Uint8Array([1,2,3,4,5,6,7,8,9,0]);
  const dv = new DataView(u8.buffer, 0, 8);
  console.log("write: " + u8.slice(0, dv.byteLength));
  const bytes = await cFile.write(dv);
}