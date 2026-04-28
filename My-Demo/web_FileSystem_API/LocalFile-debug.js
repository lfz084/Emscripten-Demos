let fileHandle;
navigator.storage.getDirectory()
.then(root => root.getFileHandle("lcFile", {
  create: true
}))
.then(handle => fileHandle = handle);

const buttons = [{
  id: "01",
  innerHTML: "open",
  onclick: async function() {
    await msg_exports.open(fileHandle, 3);
    console.log("open: " + fileHandle.name)
  }
}, {
  id: "02",
  innerHTML: "read",
  onclick: async function() {
    msg_exports.read.progressFunction = function(...args) {
      const buffer = args[0].buffer || args[0];
      const byteOffset = args[0].byteOffset || 0;
      const byteLength = args[0].byteLength;
      console.log(new Uint8Array(buffer, byteOffset, byteOffset + byteLength))
    }
    console.log("read:")
    const bytes = await msg_exports.read(new ArrayBuffer(10));
    console.log("bytes: " + bytes)
  }
}, {
  id: "03",
  innerHTML: "write",
  onclick: async function() {
    const u8 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    console.log("write")
    const bytes = await msg_exports.write(new DataView(u8.buffer, 0, 8));
    console.log("bytes: " + bytes)
  }
}, {
  id: "04",
  innerHTML: "close",
  onclick: async function() {
    await msg_exports.close();
    console.log("close")
  }
}, {
  id: "05",
  innerHTML: "seek(0)",
  onclick: async function() {
    await msg_exports.seek(0);
    console.log("seek 0")
  }
}, {
  id: "06",
  innerHTML: "size(0)",
  onclick: async function() {
    await msg_exports.truncate(0);
    console.log("truncate 0")
  }
}, {
  id: "07",
  innerHTML: "flush",
  onclick: async function() {
    await msg_exports.flush();
    console.log("flush")
  }
}];

const commands = {
  seek: async function(offset) {
    await msg_exports.seek(offset);
    console.log("seek " + offset)
  },
  truncate: async function(size) {
    await msg_exports.truncate(size);
    console.log("truncate " + size)
  },
  getSize: async function() {
    const size = await msg_exports.getSize();
    console.log("getSize " + size)
  }
}
