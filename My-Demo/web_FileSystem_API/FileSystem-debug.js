
const _script = document.createElement("script");
_script.src="JSFile.js";
document.body.appendChild(_script)

const options = {
  multiple: true,
}

async function logFileSystemHandle(handle) {
  const kind = handle.kind,
  name = handle.name;
  console.log(`kind: ${kind},\t name: ${name}`);
  if (kind == "directory") {
    const spaces = "--";
    for await(const h of handle.values()) {
      const kind = h.kind,
      name = h.name;
      console.log(spaces + `kind: ${kind},\t name: ${name}`);
    }
  }
}

const commands = {
  newFile: async function() {
    console.log(`newFile()`);
    const fileId = await msg_exports.newFile();
    console.log("new File id: " + fileId);
  },
  deleteFile: async function(fileId=1) {
    console.log(`deleteFile(${fileId})`);
    await msg_exports.deleteFile(fileId * 1);
  },
  openFilePicker: async function(options={}) {
    console.log(`openFilePicker(${options})`);
    const handleIdArr = await msg_exports.openFilePicker(options);
    console.log(...handleIdArr);
  },
  saveFilePicker: async function(options={}) {
    console.log(`saveFilePicker(${options})`);
    const handleId = await msg_exports.saveFilePicker(options);
    console.log(handleId);
  },
  openFile: async function(fileId, handleId, mode=1) {
    console.log(`openFile(${fileId}, ${handleId}, ${mode})`);
    await msg_exports.openFile(fileId * 1, handleId, mode);
  },
  closeFile: async function(fileId=1) {
    console.log(`closeFile(${fileId})`);
    await msg_exports.closeFile(fileId * 1);
  },
  flushFile: async function(fileId=1) {
    console.log(`flushFile(${fileId})`);
    await msg_exports.flushFile(fileId * 1);
  },
  truncateFile: async function(fileId=1, size) {
    console.log(`truncateFile(${fileId}, ${size})`);
    await msg_exports.truncateFile(fileId * 1, size);
  },
  seekFile: async function(fileId=1, offset) {
    console.log(`seekFile(${fileId}, ${offset})`);
    await msg_exports.seekFile(fileId * 1, offset);
  },
  getFileSize: async function(fileId=1) {
    console.log(`getFileSize(${fileId})`);
    const size = await msg_exports.getFileSize(fileId * 1);
    console.log(size);
    return size;
  },
  readFile: async function(fileId=1) {
    console.log(`readFile(${fileId})`);
    await msg_exports.readFile(fileId * 1);
  },
  writeFile: async function(fileId=1) {
    console.log(`writeFile(${fileId})`);
    await msg_exports.writeFile(fileId * 1);
  }
}

const buttons = [{
  id: "01",
  innerText: "newFile",
  onclick: async () => commands.newFile()
}, {
  id: "02",
  innerText: "deleteFile",
  onclick: async ()  => commands.deleteFile()
}, {
  id: "03",
  innerText: "newHandle",
  onclick: async () => commands.openFilePicker()
}, {
  id: "04",
  innerText: "directory",
  onclick: async () => {
    let dirhandle = await msg_exports.workerShowDirectoryPicker(options);
    logFileSystemHandle(dirhandle);
  }
}, {
  id: "05",
  innerText: "open",
  onclick: async () => commands.openFile(1, "*0")
}, {
  id: "06",
  innerText: "close",
  onclick: async () => commands.closeFile()
}, {
  id: "07",
  innerText: "read",
  onclick: async () => commands.readFile()
}, {
  id: "08",
  innerText: "write",
  onclick: async () => commands.writeFile()
}];