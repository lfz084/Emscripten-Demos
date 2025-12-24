var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';

const web_msg_exports = {};
const worker_msg_exports = {};
const worker_exports = {};

// include Message object
const Message = {
  STATUS: {
    request: 0x10,
    respone: 0x20,
    output: 0x40,
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
  /** message is a Array
  * array[0]     String    message ID
  * array[1]     Number    message type and promise status
  * array[2]     String    call function name
  * array[3]     Array     call function arguments
  */
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
  isOutputMessage: function(data) {
    return this.isMessageArray(data) && (data[1] & 0xF0) === this.STATUS.output;
  },
  createOutputMessage: function(funcname, ...args) {
    return this.createMessageArray("msgIDoutput", this.STATUS.output, funcname, ...args);
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

// include output functions
if (ENVIRONMENT_IS_WEB) {
  console.log("ENVIRONMENT_IS_WEB");
  Object.assign(web_msg_exports, {
    log: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    info: (...args) => console.info(...args),
  });
} else
  if (ENVIRONMENT_IS_WORKER) {
  console.log = (...args) => postMessage(Message.createOutputMessage("log", ...args));
  console.error = (...args) => postMessage(Message.createOutputMessage("error", ...args));
  console.warn = (...args) => postMessage(Message.createOutputMessage("warn", ...args));
  console.info = (...args) => postMessage(Message.createOutputMessage("info", ...args));
  console.log("ENVIRONMENT_IS_WORKER");
} else throw new Error("The script only run in 'web or worker'")
// end output functions

// include verifyPermission function
if (ENVIRONMENT_IS_WEB) {
  Object.assign(web_msg_exports, {
    verifyPermission: function(...args) {
      return confirm(...args);
    }
  })
} else
  if (ENVIRONMENT_IS_WORKER) {
  Object.assign(worker_msg_exports, {
    verifyPermission: async function(...args) {
      return postMessagePromise(()=> {}, Message.createRequestMessage("verifyPermission", ...args));
    }
  })
}
// end verifyPermission function

// include user import function
if (ENVIRONMENT_IS_WEB) {
  function createFunction(funcname) {
    return async function(...args) {
      return postMessagePromise(()=> {}, Message.createRequestMessage(funcname, ...args));
    }
  }
  function createProgressFunction(funcname) {
    return async function(...args) {
      const progress = args.shift();
      return postMessagePromise(progress, Message.createRequestMessage(funcname, ...args));
    }
  }
  Object.assign(worker_exports, {
    add: createFunction("add"),
    delay: createFunction("delay"),
    testError: createFunction("testError"),
    returnArray: createFunction("returnArray"),
    testVerify: createFunction("testVerify"),
    testProgress: createProgressFunction("testProgress"),
  });
} else
  if (ENVIRONMENT_IS_WORKER) {
  function add(msgID, ...args) {
    let sum = 0;
    for (let i = 0; i < args.length; i++)
      sum += args[i];
    return sum
  }

  function delay(msgID, ms) {
    return new Promise(resolve => setTimeout(() => resolve("delay: " + ms + "ms"), ms));
  }

  function testError(msgID) {
    throw "testError";
  }

  function returnArray(msgID, arr) {
    return arr;
  }
  
  function testVerify() {
    return worker_msg_exports["verifyPermission"]("worker verify")
  }

  function testProgress(msgID, ...args) {
    return new Promise(resolve => {
      let p = 0;
      const timer = setInterval(() => {
        p += 0.1;
        postMessage(Message.createProgreesMessage(msgID, "testProgress", p));
        if (p > 1) {
          clearInterval(timer);
          resolve(...args);
        }
      },
        200)
    })
  }

  Object.assign(worker_msg_exports, {
    add, delay, testError, returnArray, testVerify, testProgress
  });
}
// end user import function

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

let postMessagePromise = function(){}
const _postMessagePromise = async function (object, progress = ()=> {}, messageArray) {
  const {
    msgID
  } = Message.parseMessageArray(messageArray);
  const thisMsgID = msgID;
  return new Promise((resolve, reject) => {
    function onMsg(e) {
      const data = e.data;
      if (Message.isResponeMessage(data)) {
        const {
          msgID,
          result
        } = Message.parseMessageArray(data);
        if (thisMsgID !== msgID) return;
        if (Message.isResolveMessage(data)) {
          resolve(result);
          removeEvent();
        } else if (Message.isRejectMessage(data)) {
          reject(result);
          removeEvent();
        } else if (Message.isProgreesMessage(data)) {
          typeof progress === "function" && progress(result);
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
      if (Message.isMessageArray(data)) {
        if (Message.isResponeMessage(data)) return;
        const {
          msgID,
          funcname,
          args
        } = Message.parseMessageArray(data);
        const result = await (catchError(web_msg_exports[funcname]))(...args);
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
        if (worker_msg_exports[funcname]) {
          try {
            const result = await (worker_msg_exports[funcname])(msgID, ...args);
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