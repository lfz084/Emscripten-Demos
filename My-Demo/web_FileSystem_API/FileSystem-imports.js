// [options] = { [id = string], [mode = "read" | "readwrite"], [startIn = "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos"] }
// return Promise resolve FileSystemDirectoryHandle
async function showDirectoryPicker(options) {
  return window.showDirectoryPicker(options);
}

// [options] = {[id = string], [multiple = boolean], [startIn = "desktop" | ...], [excludeAcceptAllOption = boolean], [type = Array {accept : {key: value}, [description = string]}]}
// return Promise resolve [FileSystemFileHandle, ...]
async function showOpenFilePicker(options) {
  return window.showOpenFilePicker(options);
}

// [options] = {[id = string], [suggestedName = string], [startIn = "desktop" | ...], [excludeAcceptAllOption = boolean], [type = Array {accept : {key: value}, [description = string]}]}
// return Promise resolve FileSystemFileHandle
async function showSaveFilePicker(options) {
  return window.showSaveFilePicker(options);
}

// fileHandle = FileSystemFileHandle
// mode = "read" | "write" | "readwrite"
// return true | false
async function verifyPermission(fileHandle, mode) {
  const opt = {
    mode
  };
  if ((await fileHandle.queryPermission(opt)) === "granted") {
    return true;
  }
  if ((await fileHandle.requestPermission(opt)) === "granted") {
    return true;
  }
  return false;
}