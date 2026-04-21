{
  const ENVIRONMENT_IS_WEB = typeof window == 'object';
  const ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';

  let fileIdIndex = 0;
  const NUM_MAX_FILES = 0xFF;
  const filesMap = new Map();
  
  let handleIdIndex = 0;
  const NUM_MAX_HANDLE = NUM_MAX_FILES;
  const handlesMap = new Map();
  
  const _root = [];
  const storageManager = ENVIRONMENT_IS_WEB ? navigator.storage : WorkerNavigator.storage;
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
    return filesMap.get(id);
  }
  
  const getIdHandle = function(id) { 
    return handlesMap.get(id);
  }
  
  const getSyncFileHandle = async function(filename, options) {
    const path = filename.split(/\//).filter(v=>v);
    const name = path.pop();
    if (!name) return;
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
  
  var FileSystem = {
    openFile: async function(id, path, options) {
      let file = getIdFile(id);
      if (!file) throw new Error("file object is not found");
      if (typeof path !== "string") throw new Error("'path' is not string");
      const fileClass = path[0] === "*" ? JSFile : LocalFile;
      const handle = await (fileClass.name === "JSFile" ? getIdHandle(path) : getSyncFileHandle(path, options));
      if (!handle) throw new Error("fileHandle Error");
      file.close();
      if (file.constructor.name !== fileClass.name) {
        file = new fileClass();
        filesMap.set(id, file);
      }
      return file.open(handle, options); 
    },
    closeFile: function(id, ...args) {
      const file = getIdFile(id);
      if (!file) throw new Error("file object is not found");
      return file.close(...args);
    },
    readFile:  function(id, ...args) {
      const file = getIdFile(id);
      if (!file) throw new Error("file object is not found");
      return file.read(...args);
    },
    writeFile: function(id, ...args) {
      const file = getIdFile(id);
      if (!file) throw new Error("file object is not found");
      return file.write(...args);
    },
  };
  Object.freeze(FileSystem);
  
}