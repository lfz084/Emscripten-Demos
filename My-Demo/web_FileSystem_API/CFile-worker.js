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
  Object.assign(msg_exports, {
  	showDirectoryPicker,
  	showOpenFilePicker,
  	showSaveFilePicker,
  	verifyPermission,
  })
} else
  if (ENVIRONMENT_IS_WORKER) {
  
  Object.assign(msg_exports, {
  	showDirectoryPicker: createMessageFunction("showDirectoryPicker"),
  	showOpenFilePicker: createMessageFunction("showOpenFilePicker"),
  	showSaveFilePicker: createMessageFunction("showSaveFilePicker"),
  	verifyPermission: createMessageFunction("verifyPermission"),
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
  	saveFilePicker: createMessageFunction("saveFilePicker"),
  	open: createMessageFunction("open"),
  	close: createMessageFunction("close"),
  	getSize: createMessageFunction("getSize"),
  	truncate: createMessageFunction("truncate"),
  	seek: createMessageFunction("seek"),
  	read: createMessageFunction("read"),
  	write: createMessageFunction("write"),
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
  importScripts("./JSFile.js", "./LocalFile.js", "./FileSystem.js", "./CFile.js");
  
  const cFile = new CFile(FileSystem.addFile());
  
  async function openFilePicker(...args) {
    return FileSystem.openFilePicker(...args)
  }
  
  async function saveFilePicker(...args) {
    return FileSystem.saveFilePicker(...args)
  }
  
  async function open(...args) {
    return cFile.open(...args)
  }
  
  async function close(...args) {
    return cFile.close(...args)
  }
  
  async function getSize(...args) {
    return cFile.getSize(...args)
  }
  
  async function truncate(...args) {
    return cFile.truncate(...args)
  }
  
  async function seek(...args) {
    return cFile.seek(...args)
  }
  
  async function read(...args) {
    const buffer = new ArrayBuffer(10);
    const bytes = await cFile.read(buffer);
    console.log("read: " + new Uint8Array(buffer, 0, bytes));
    console.log("bytes: " + bytes)
  }
  
  async function write(...args) {
    const u8 = new Uint8Array([1,2,3,4,5,6,7,8,9,0]);
    const dv = new DataView(u8.buffer, 0, 8);
    console.log("write: " + u8.slice(0, dv.byteLength));
    const bytes = await cFile.write(dv);
  }
  Object.assign(msg_exports, {
  	openFilePicker,
  	saveFilePicker,
  	open,
  	close,
  	getSize,
  	truncate,
  	seek,
  	read,
  	write,
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
        const result = await (catchError(msg_exports[funcname]))(...args);
        Message.isRequestMessage(data) && worker.postMessage(Message.createResolveMessage(msgID, funcname, result));
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