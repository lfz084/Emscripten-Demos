importScripts("./JSFile.js", "./LocalFile.js", "./FileSystem.js");

function newFile(...args) {
  return FileSystem.addFile(...args);
}

function deleteFile(...args) {
  return FileSystem.removeFile(...args);
}

function openFilePicker(...args) {
  return FileSystem.openFilePicker(...args);
}

function saveFilePicker(...args) {
  return FileSystem.saveFilePicker(...args);
}

function openFile(...args) {
  return FileSystem.openFile(...args);
}

function closeFile(...args) {
  return FileSystem.closeFile(...args);
}

function flushFile(...args) {
  return FileSystem.flushFile(...args);
}

function truncateFile(...args) {
  return FileSystem.truncateFile(...args);
}

function seekFile(...args) {
  return FileSystem.seekFile(...args);
}

function getFileSize(...args) {
  return FileSystem.getFileSize(...args);
}

async function readFile(fileId) {
  const u8 = new Uint8Array(new ArrayBuffer(10));
  const dv = new DataView(u8.buffer, 0, u8.byteLength);
  const bytes = await FileSystem.readFile(fileId, dv);
  console.log("read: " + u8.slice(0, bytes));
  console.log("bytes: " + bytes)
}

async function writeFile(fileId) {
  const u8 = new Uint8Array([1,2,3,4,5,6,7,8,9,0]);
  const dv = new DataView(u8.buffer, 0, 8);
  await FileSystem.writeFile(fileId, dv);
  console.log("write: " + new Uint8Array(dv.buffer, dv.offset, dv.byteLength));
}