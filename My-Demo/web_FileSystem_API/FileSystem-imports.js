// [options] = { [id = string], [mode = "read" | "readwrite"], [startIn = "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos"] }
// return Promise resolve FileSystemDirectoryHandle
async function showDirectoryPicker(options) {
  return window.showDirectoryPicker(options);
}

// [options] = {[id = string], [multiple = boolean], [startIn = "desktop" | ...], [excludeAcceptAllOption = boolean], [type = Array {accept : {key: value}, [description = string]}]}
// return Promise resolve [FileSystemFileHandle, ...]
async function showOpenFilePicker(options) {
  return typeof window.showOpenFilePicker === "function" ? window.showOpenFilePicker(options) : _input_select_file();
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

const _input_select_file = async function() {
  const inputElement = document.createElement("input");
  inputElement.type = "file";
  inputElement.style.display = "none";
  document.body.appendChild(inputElement);
  inputElement.click();
  return new Promise((resolve, reject) => {
    inputElement.addEventListener("change", e => {
      console.log("change");
      inputElement.remove();
      resolve([...inputElement.files]);
    })
    inputElement.addEventListener("cancel", e => {
      console.log("cancel");
      inputElement.remove();
      reject(new Error("selectFile cancelled."));
    })
  })
}