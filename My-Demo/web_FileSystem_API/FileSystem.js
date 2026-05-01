{
  const ENVIRONMENT_IS_WEB = typeof window == 'object';
  const ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
  
  const BIT_MODE = 0xFF;
  const BIT_CREATE = 1 << 8;
  
  let fileIdIndex = 0;
  const NUM_MAX_FILES = 0xFF;
  const filesMap = new Map();
  
  let handleIdIndex = 0;
  const NUM_MAX_HANDLE = NUM_MAX_FILES;
  const handlesMap = new Map();
  
  const _root = [];
  const storageManager = ENVIRONMENT_IS_WEB ? navigator.storage : navigator.storage;
  storageManager.getDirectory().then(root=>(_root.length = 1, _root[0] = root, Object.freeze(_root)))
  
  const getNewFileId = function () {
    while(filesMap.size < NUM_MAX_FILES) {
      const id = fileIdIndex << 1 | 1;
      fileIdIndex = ++fileIdIndex & NUM_MAX_FILES;
      if(!filesMap.has(id))  return id;
    }
  }
  
  const getNewHandleId = function () {
    while(handlesMap.size < NUM_MAX_HANDLE) {
      const id = "*" + handleIdIndex;
      handleIdIndex = ++handleIdIndex & NUM_MAX_HANDLE;
      if(!handlesMap.has(id))  return id;
    }
  }
  
  const addFile = function(file) {
    const id = getNewFileId();
    if (!id) throw new Error("addFile Error: filesMap is full");
    filesMap.set(id, file);
    return id;
  }
  
  const addFileHandle = function(handle) {
    const id = getNewHandleId();
    if (!id) throw new Error("addFileHandle Error: handlesMap is full");
    handlesMap.set(id, handle);
    return id;
  }
  
  const removeFile = function(id){
    if (filesMap.has(id)) filesMap.delete(id);
  }
  
  const removeFileHandle = function(id) {
    if (handlesMap.has(id)) handlesMap.delete(id);
  }
  
  const getIdFile = function(id) { 
    const file = filesMap.get(id);
    if (!file) throw new Error("file object is not found");
    return file;
  }
  
  const getIdHandle = function(id) { 
    const handle = handlesMap.get(id);
    if (!handle) throw new Error("fileHandle Error");
    return handle;
  }
  
  const getSyncFileHandle = async function(filename, create) {
    const path = filename.split(/\//).filter(v=>v);
    const name = path.pop();
    if (!name) return;
    const options = { create: !!create };
    let dir = getRoot();
    for(let i = 0; i < path.length; i++) {
      dir = await dir.getDirectoryHandle(path[i], options).catch(e=>{console.error(e.message)});
      if (!dir) return;
    }
    const fileHandle = await dir.getFileHandle(name, options).catch(e=>{console.error(e.message)});
    if (!fileHandle) return;
    return fileHandle;
  }
  
  const getRoot = function() { 
    return _root[0];
  }
  
  const _FileSystem = class FileSystem extends Object {};
  const fileSystem = new _FileSystem();
  
  var FileSystem = Object.assign(fileSystem, {
    addFile: function() {
      return addFile(new JSFile());
    },
    removeFile: function(fileId) {
      return removeFile(fileId);
    },
    openFilePicker: async function(options) {
      const handles = await showOpenFilePicker(options);
      const handleIdArr = handles.map(handle => addFileHandle(handle));
      return handleIdArr;
    },
    saveFilePicker: async function(options) {
      const handle = await showSaveFilePicker(options);
      const handleId = addFileHandle(handle);
      return handleId;
    },
    openFile: async function(fileId, path, create_mode) {
      let file = getIdFile(fileId);
      if (typeof path !== "string") throw new Error("'path' is not string");
      const fileClass = path[0] === "*" ? JSFile : LocalFile;
      const handle = await (fileClass.name === "JSFile" ? getIdHandle(path) : getSyncFileHandle(path, BIT_CREATE & create_mode));
      file.close();
      if (file.constructor.name !== fileClass.name) {
        file = new fileClass();
        filesMap.set(fileId, file);
      }
      return file.open(handle, BIT_MODE & create_mode); 
    },
    closeFile: async function(fileId, ...args) {
      const file = getIdFile(fileId);
      return file.close(...args);
    },
    flushFile: async function(fileId) {
      const file = getIdFile(fileId);
      return file.flush();
    },
    getFileSize: async function(fileId) {
      const file = getIdFile(fileId);
      return file.getSize();
    },
    truncateFile: async function(fileId, size) {
      const file = getIdFile(fileId);
      return file.truncate(size);
    },
    seekFile: async function(fileId, offset) {
      const file = getIdFile(fileId);
      return file.seek(offset);
    },
    readFile:  async function(fileId, ...args) {
      const file = getIdFile(fileId);
      return file.read(...args);
    },
    writeFile: async function(fileId, ...args) {
      const file = getIdFile(fileId);
      return file.write(...args);
    },
  });
  Object.freeze(FileSystem);
}