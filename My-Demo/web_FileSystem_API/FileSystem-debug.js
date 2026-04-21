document.body.onload = async function() {
  btn01.innerText = "open";
  btn02.innerText = "save";
  btn03.innerText = "directory";

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

  btn01.onclick = async () => {
    let filehandles = await msg_exports.workerShowOpenFilePicker(options);
    filehandles.map(logFileSystemHandle)
  }

  btn02.onclick = async () => {
    let filehandle = await msg_exports.workerShowSaveFilePicker(options);
    logFileSystemHandle(filehandle);
  }

  btn03.onclick = async () => {
    let dirhandle = await msg_exports.workerShowDirectoryPicker(options);
    logFileSystemHandle(dirhandle);
  }
}