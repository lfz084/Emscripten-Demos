// [options] = { [id = string], [mode = "read" | "readwrite"], [startIn = "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos"] }
// return Promise resolve FileSystemDirectoryHandle
async function workerShowDirectoryPicker(options) {
  return msg_exports.showDirectoryPicker(options);
}

// [options] = {[id = string], [multiple = boolean], [startIn = "desktop" | ...], [excludeAcceptAllOption = boolean], [type = Array {accept : {key: value}, [description = string]}]}
// return Promise resolve [FileSystemFileHandle, ...]
async function workerShowOpenFilePicker(options) {
  return msg_exports.showOpenFilePicker(options);
}

// [options] = {[id = string], [suggestedName = string], [startIn = "desktop" | ...], [excludeAcceptAllOption = boolean], [type = Array {accept : {key: value}, [description = string]}]}
// return Promise resolve FileSystemFileHandle
async function workerShowSaveFilePicker(options) {
  return msg_exports.showSaveFilePicker(options);
}