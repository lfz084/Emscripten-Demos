// include ENVIRONMENT
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
// end ENVIRONMENT

// debug
const OUTPUT_MSG_DATA = false;
// end debug

const msg_exports = {};
const worker_exports = msg_exports;

// include Message object
// Using Message object create MessageArray for Web Worker Message
// MessageArray is a Array
// * array[0]     String    message ID
// * array[1]     Number    message type and promise status
// * array[2]     String    call function name
// * array[3]     Array     call function arguments
const Message = {
  STATUS: {
    request: 0x10,
    respone: 0x20,
    notify: 0x40,
    resolve: 0x01,
    reject: 0x02,
    progress: 0x03
  },
  ENVIRONMENT: ENVIRONMENT_IS_WEB ? "web": "wok",
  numID: 0,
  newID: function() {
    this.numID = ++this.numID & 0x7FFFFFFF;
    return "msgID" + this.ENVIRONMENT + this.numID;
  },
  isMessageArray: function(data) {
    return Array.isArray(data) && data.length === 4 && data[0].constructor.name === "String" && data[0].indexOf("msgID") === 0;
  },
  parseMessageArray: function(data) {
    return {
      msgID: data[0],
      status: data[1],
      funcname: data[2],
      args: data[3],
      result: data[3][0]
    };
  },
  createMessageArray: function(msgID, status, funcname, ...args) {
    return [
      msgID,
      status,
      funcname,
      args
    ];
  },
  isNotifyMessage: function(data) {
    return this.isMessageArray(data) && (data[1] & 0xF0) === this.STATUS.createMessageFunction;
  },
  createNotifyMessage: function(funcname, ...args) {
    return this.createMessageArray("msgID" + this.ENVIRONMENT + "notify", this.STATUS.notify, funcname, ...args);
  },
  isRequestMessage: function(data) {
    return this.isMessageArray(data) && (data[1] & 0xF0) === this.STATUS.request;
  },
  createRequestMessage: function(funcname, ...args) {
    return this.createMessageArray(this.newID(), this.STATUS.request, funcname, ...args);
  },
  isResponeMessage: function(data) {
    return this.isMessageArray(data) && (data[1] & 0xF0) === this.STATUS.respone;
  },
  createResponeMessage: function(msgID, funcname, ...args) {
    return this.createMessageArray(msgID, this.STATUS.respone, funcname, ...args);
  },
  isProgreesMessage: function(data) {
    return this.isResponeMessage(data) && (data[1] & 0x0F) === this.STATUS.progress;
  },
  createProgreesMessage: function(msgID, funcname, ...args) {
    const data = this.createResponeMessage(msgID, funcname, ...args);
    data[1] = data[1] | this.STATUS.progress;
    return data;
  },
  isResolveMessage: function(data) {
    return this.isResponeMessage(data) && (data[1] & 0x0F) === this.STATUS.resolve;
  },
  createResolveMessage: function(msgID, funcname, ...args) {
    const data = this.createResponeMessage(msgID, funcname, ...args);
    data[1] = data[1] | this.STATUS.resolve;
    return data;
  },
  isRejectMessage: function(data) {
    return this.isResponeMessage(data) && (data[1] & 0x0F) === this.STATUS.reject;
  },
  createRejectMessage: function(msgID, funcname, ...args) {
    const data = this.createResponeMessage(msgID, funcname, ...args);
    data[1] = data[1] | this.STATUS.reject;
    return data;
  },
};
// end Message object

// include notify functions
if (ENVIRONMENT_IS_WEB) {
  console.log("ENVIRONMENT_IS_WEB");
  Object.assign(msg_exports, {
    log: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    info: (...args) => console.info(...args),
  });
} else
  if (ENVIRONMENT_IS_WORKER) {
  console.log = (...args) => postMessage(Message.createNotifyMessage("log", ...args));
  console.error = (...args) => postMessage(Message.createNotifyMessage("error", ...args));
  console.warn = (...args) => postMessage(Message.createNotifyMessage("warn", ...args));
  console.info = (...args) => postMessage(Message.createNotifyMessage("info", ...args));
  console.log("ENVIRONMENT_IS_WORKER");
} else throw new Error("The script only run in 'web or worker'")
// end notify functions

function getProgressFunction(funcname) {
  return msg_exports[funcname].progressFunction;
}

function createMessageFunction(funcname) {
  return async function(...args) {
    return postMessagePromise(Message.createRequestMessage(funcname, ...args));
  }
}

// include imports.js
// the functions run in the web
// import functions to worker
if (ENVIRONMENT_IS_WEB) {
  
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
  Object.assign(msg_exports, {
  	showDirectoryPicker,
  	showOpenFilePicker,
  	showSaveFilePicker,
  	verifyPermission,
  })
  
  Object.assign(msg_exports, {
  })
} else
  if (ENVIRONMENT_IS_WORKER) {
  
  Object.assign(msg_exports, {
  	showDirectoryPicker: createMessageFunction("showDirectoryPicker"),
  	showOpenFilePicker: createMessageFunction("showOpenFilePicker"),
  	showSaveFilePicker: createMessageFunction("showSaveFilePicker"),
  	verifyPermission: createMessageFunction("verifyPermission"),
  })
  Object.assign(msg_exports, {
  })
}
// end imports.js

// include exports.js
// the functions run in the worker
// export functions to web
if (ENVIRONMENT_IS_WEB) {
  
  Object.assign(msg_exports, {
  	workerShowDirectoryPicker: createMessageFunction("workerShowDirectoryPicker"),
  	workerShowOpenFilePicker: createMessageFunction("workerShowOpenFilePicker"),
  	workerShowSaveFilePicker: createMessageFunction("workerShowSaveFilePicker"),
  	workerVerifyPermission: createMessageFunction("workerVerifyPermission"),
  })
  Object.assign(msg_exports, {
  	openFilePicker: createMessageFunction("openFilePicker"),
  	open: createMessageFunction("open"),
  	close: createMessageFunction("close"),
  	flush: createMessageFunction("flush"),
  	getSize: createMessageFunction("getSize"),
  	truncate: createMessageFunction("truncate"),
  	seek: createMessageFunction("seek"),
  	read: createMessageFunction("read"),
  	write: createMessageFunction("write"),
  	testWrite: createMessageFunction("testWrite"),
  	testRead: createMessageFunction("testRead"),
  	testWriteRead: createMessageFunction("testWriteRead"),
  })
} else
  if (ENVIRONMENT_IS_WORKER) {
  
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
  
  // fileHandle = FileSystemFileHandle
  // mode = "read" | "write" | "readwrite"
  // return true | false
  async function workerVerifyPermission(fileHandle, mode) {
    return msg_exports.verifyPermission(fileHandle, mode)
  }
  
  var showDirectoryPicker = workerShowDirectoryPicker;
  var showOpenFilePicker = workerShowOpenFilePicker;
  var showSaveFilePicker = workerShowSaveFilePicker;
  var verifyPermission = workerVerifyPermission;
  
  Object.assign(msg_exports, {
  	workerShowDirectoryPicker,
  	workerShowOpenFilePicker,
  	workerShowSaveFilePicker,
  	workerVerifyPermission,
  })
  importScripts("./JSFile.js", "./LocalFile.js", "./FileSystem.js");
  
  var Module = {
    onRuntimeInitialized: function() {
      console.log("Module:")
      console.log(Object.keys(Module))
      console.log("WASM Ready")
    },
    printError: function(e) {
      console.error(e.stack || e.message || e.toString())
    },
    FileSystem
  };
  
  console.log("load WASM")
  importScripts("./CFile-Demo.js");
  
  //------------- exports -------------------------
  
  async function openFilePicker() {
    return FileSystem.openFilePicker();
  }
  
  async function open(path, mode) {
    const str_buf = Module.get_str_buffer();
    const str_buf_size = Module.get_str_buffer_size();
    stringToUTF8(path, str_buf, str_buf_size);
    return Module.open(str_buf, mode);
  }
  
  async function close() {
    return Module.close();
  }
  
  async function flush() {
    return Module.flush();
  }
  
  async function getSize() {
    return Module.getSize();
  }
  
  async function truncate(size) {
    return Module.truncate(size);
  }
  
  async function seek(offset) {
    return Module.seek(offset);
  }
  
  async function read() {
    const buffer = Module.get_data_buffer();
    const buffer_size = Module.get_data_buffer_size();
    const bytes = await Module.read(buffer, buffer_size);
    console.log(bytes + "bytes: " + new Uint8Array(Module.wasmMemory.buffer, buffer, bytes));
  }
  
  async function write() {
    const buffer = Module.get_data_buffer();
    // const buffer_size = Module.get_data_buffer_size();
    const writeSize = 8;
    const u8 = new Uint8Array(Module.wasmMemory.buffer, buffer, writeSize);
    [1,2,3,4,5,6,7,8,9,0].map((v,i) => u8[i] = v);
    const bytes = await Module.write(buffer, writeSize);
    console.log(bytes + "bytes: " + u8);
  }
  
  const writeText = "在针对 WebAssembly 时，Module.instantiateWasm 是一个可选的用户实现的回调函数，Emscripten 运行时会调用它来执行 WebAssembly 实例化操作。回调函数将被调用，带有两个参数，imports 和 successCallback。 imports 是一个 JS 对象，包含实例化时需要传递给 WebAssembly 模块的所有函数导入，并且一旦实例化，此回调函数应使用生成的 WebAssembly 实例对象调用 successCallback()。实例化可以同步或异步执行。此函数的返回值应包含实例化的 WebAssembly 模块的 exports 对象，或者如果实例化是异步执行的，则包含一个空字典对象 {}，或者如果实例化失败，则包含 false。通过此函数覆盖 WebAssembly 实例化过程在您有其他自定义异步启动操作或下载（可以与 WebAssembly 编译并行执行）时非常有用。实现此回调允许并行执行所有这些操作。有关此结构如何在实践中工作的示例，请参见文件 test/manual_wasm_instantiate.html 和测试";
  
  async function testWrite(path) {
    const encoder = new TextEncoder();
    const maxWriteSize = 8;
    const writeTextDataU8 = encoder.encode(writeText);
    const pBuffer = Module.get_data_buffer();
    
    await close();
    await open(path, 2);
    await truncate(0);
    let index = 0;
    console.log("write test:")
    while (index < writeTextDataU8.length) {
      const writeSize = Math.min(maxWriteSize, writeTextDataU8.length - index);
      const u8 = new Uint8Array(writeTextDataU8.buffer, index, writeSize);
      const dvU8 = new Uint8Array(Module.wasmMemory.buffer, pBuffer, writeSize);
      u8.map((v, i) => dvU8[i] = u8[i]);
      const bytes = await Module.write(pBuffer, writeSize);
      index = index + writeSize;
      console.log(dvU8);
      console.log(bytes, index);
    }
    console.log("close file");
    await close();
    return writeTextDataU8;
  }
  
  async function testRead(path) {
    const decoder = new TextDecoder();
    const maxReadSize = 16;
    const dataArr = [];
    const pBuffer = Module.get_data_buffer();
    
    await close();
    await open(path, 1)
    let bytes = 0;
    console.log("read test");
    do {
      bytes = await Module.read(pBuffer, maxReadSize);
      const u8 = new Uint8Array(Module.wasmMemory.buffer, pBuffer, bytes);
      dataArr.push(...u8);
      console.log(u8);
      console.log(bytes);
    } while (bytes > 0)
    console.log("close file");
    await close();
    const readTextDataU8 = new Uint8Array(dataArr);
    return readTextDataU8;
  }
  
  async function testWriteRead(path) {
    const writeTextDataU8 = await testWrite(path);
    const readTextDataU8 = await testRead(path);
    const comp = function(a, b) {
      return a.length === b.length && !a.map((v,i)=>a[i]!==b[i]).filter(v=>v).length;
    }
    console.log("testWriteRead: " + comp(readTextDataU8, writeTextDataU8));
  }
  Object.assign(msg_exports, {
  	openFilePicker,
  	open,
  	close,
  	flush,
  	getSize,
  	truncate,
  	seek,
  	read,
  	write,
  	testWrite,
  	testRead,
  	testWriteRead,
  })
}
// end exports.js

function errToString(e) {
  return e.stack || e.message || e.toString();
}

function catchError(callback) {
  return (...args) => {
    try {
      return callback(...args)
    }
    catch (e) {
      console.error(errToString(e));
      throw e;
    }
  }
}

var dirname;
var dirfile;
if (ENVIRONMENT_IS_WEB) {
  function getCurrentScript() {
    let script = document.currentScript;
    if (!script) {
      let scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        script = scripts[i];
        if (script.src.indexOf("worker.js") + 1) return script;
      }
    }
    return script;
  }
  const currentScript = getCurrentScript();
  dirfile = currentScript.src;
  dirname = dirfile.slice(0, dirfile.lastIndexOf("/") & 0x7FFFFFFF)
}

let postMessagePromise = function() {};
const _postMessagePromise = async function (object, messageArray) {
  const {
    msgID,
    funcname
  } = Message.parseMessageArray(messageArray);
  const thisMsgID = msgID;
  const thisProgressFunc = getProgressFunction(funcname);
  return new Promise((resolve, reject) => {
    function onMsg(e) {
      const data = e.data;
      if (Message.isResponeMessage(data)) {
        const {
          msgID,
          args,
          result
        } = Message.parseMessageArray(data);
        if (thisMsgID !== msgID) return;
        if (Message.isResolveMessage(data)) {
          resolve(result);
          removeEvent();
        } else if (Message.isRejectMessage(data)) {
          reject(new Error(result)); // result is error string
          removeEvent();
        } else if (Message.isProgreesMessage(data)) {
          typeof thisProgressFunc === "function" && thisProgressFunc(...args);
        }
      }
    }
    function onErr(e) {
      reject(e);
      removeEvent();
    }
    function addEvent() {
      object.addEventListener("message", onMsg);
      object.addEventListener("error", onErr);
    }
    function removeEvent() {
      object.removeEventListener("message", onMsg);
      object.removeEventListener("error", onErr);
    }
    addEvent();
    object.postMessage(messageArray);
  })
}

if (ENVIRONMENT_IS_WEB) {
  try {
    const worker = new Worker(dirfile);
    worker.onmessage = async function(e) {
      const data = e.data;
      OUTPUT_MSG_DATA && console.info(data);
      if (Message.isMessageArray(data)) {
        if (Message.isResponeMessage(data)) return;
        const {
          msgID,
          funcname,
          args
        } = Message.parseMessageArray(data);
        try {
          const result = await msg_exports[funcname](...args);
          Message.isRequestMessage(data) && worker.postMessage(Message.createResolveMessage(msgID, funcname, result));
        }catch(e) {
          console.error(errToString(e))
        }
      } else console.warn("Unknown message: " + data)
    }
    worker.onerror = function(e) {
      e.filename && console.error(`Error:\n[ ${e.filename}:${e.lineno}:${e.colno} ]`);
      e.error && console.error(errToString(e.error));
    }

    postMessagePromise = function(...args) {
      return _postMessagePromise(worker, ...args);
    }
  }catch(e) {
    console.error(errToString(e))
  }
} else
  if (ENVIRONMENT_IS_WORKER) {
  try {
    onmessage = async function (e) {
      const data = e.data;
      OUTPUT_MSG_DATA && console.info(data);
      if (Message.isMessageArray(data)) {
        if (!Message.isRequestMessage(data)) return;
        const {
          msgID,
          funcname,
          args
        } = Message.parseMessageArray(data);
        function _resolve(result) {
          postMessage(Message.createResolveMessage(msgID, funcname, result));
        }
        function _reject(errMsg) {
          postMessage(Message.createRejectMessage(msgID, funcname, errMsg));
        }
        if (msg_exports[funcname]) {
          try {
            msg_exports[funcname].progressFunction = (...args) => postMessage(Message.createProgreesMessage(msgID, funcname, ...args));
            const result = await (msg_exports[funcname])(...args);
            _resolve(result);
          }catch(e) {
            _reject(errToString(e))
          }
        } else {
          _reject(`function "${funcname}" not found`);
        }
      } else console.warn("Unknown message: " + e.data);
    }

    postMessagePromise = function(...args) {
      return _postMessagePromise(self, ...args);
    }

  }catch(e) {
    console.error(errToString(e))
  }
}