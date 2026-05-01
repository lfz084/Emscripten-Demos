const commands = {
  openFilePicker: async () => {
    console.log(`openFilePicker()`);
    const handles = await msg_exports.openFilePicker();
    console.log(...handles)
  },
  saveFilePicker: async () => {
    console.log(`saveFilePicker()`);
    const handle = await msg_exports.saveFilePicker();
    console.log(handle)
  },
  open: async (path, mode) => {
    console.log(`open(${path}, ${mode})`);
    return msg_exports.open(path, mode);
  },
  close: async () => {
    console.log(`close()`);
    return msg_exports.close();
  },
  getSize: async () => {
    console.log(`getSize()`);
    const size = await msg_exports.getSize();
    console.log(size)
  },
  truncate: async (size=0) => {
    console.log(`truncate(${size})`);
    return msg_exports.truncate(size);
  },
  seek: async (offset=0) => {
    console.log(`seek(${offset})`);
    return msg_exports.seek(offset);
  },
  read: async () => {
    console.log(`read()`);
    return msg_exports.read();
  },
  write: async () => {
    console.log(`write()`);
    return msg_exports.write();
  },
  testWrite: async (path) => {
    console.log(`testWrite(${path})`);
    return msg_exports.testWrite(path);
  },
  testRead: async (path) => {
    console.log(`testRead(${path})`);
    return msg_exports.testRead(path);
  },
  testWriteRead: async (path) => {
    console.log(`testWriteRead(${path})`);
    return msg_exports.testWriteRead(path);
  },
};