commands = {
  openFilePicker: async () => {
    console.log("openFilePicker()");
    const path = await msg_exports.openFilePicker();
    console.log(path);
  },
  open: async (path, mode) => {
    console.log(`open(${path}, ${mode})`);
    return msg_exports.open(path, mode);
  },
  close: async () => {
    console.log("close()");
    return msg_exports.close();
  },
  flush: async () => {
    console.log("flush()");
    return msg_exports.flush();
  },
  getSize: async () => {
    console.log("getSize()");
    const size = await msg_exports.getSize();
    console.log(size);
  },
  truncate: async (size) => {
    console.log(`truncate(${size})`);
    return msg_exports.truncate(size);
  },
  seek: async (offset) => {
    console.log(`seek(${offset})`);
    return msg_exports.seek(offset);
  },
  read: async () => {
    console.log("read()");
    return msg_exports.read();
  },
  write: async () => {
    console.log("write()");
    return msg_exports.write();
  },
  testWriteRead: async (path) => {
    console.log("testWriteRead()");
    return msg_exports.testWriteRead(path);
  }
}