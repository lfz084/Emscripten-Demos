var Module = typeof Module != 'undefined' ? Module: {};

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && process.versions?.node && process.type != 'renderer';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

var isFileURI = (filename) => filename.startsWith('file://');

// Hooks that are implemented differently in different runtime environments.
var wasmBinaryFile, wasmBinary;
var readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
  var fs = require('fs');
  readBinary = (filename) => {
    // We need to re-wrap `file://` strings to URLs.
    filename = isFileURI(filename) ? new URL(filename): filename;
    var ret = fs.readFileSync(filename);
    assert(Buffer.isBuffer(ret));
    return ret;
  };

  readAsync = async (filename, binary = true) => {
    // See the comment in the `readBinary` function.
    filename = isFileURI(filename) ? new URL(filename): filename;
    var ret = fs.readFileSync(filename, binary ? undefined: 'utf8');
    assert(binary ? Buffer.isBuffer(ret): typeof ret == 'string');
    return ret;
  };

} else
  if (ENVIRONMENT_IS_SHELL) {

  const isNode = typeof process == 'object' && process.versions?.node && process.type != 'renderer';
  if (isNode || typeof window == 'object' || typeof WorkerGlobalScope != 'undefined') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

} else
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  readBinary = (url) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.responseType = 'arraybuffer';
    xhr.send(null);
    return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
  };

  readAsync = async (url) => {
    // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
    // See https://github.com/github/fetch/pull/92#issuecomment-140665932
    // Cordova or Electron apps are typically loaded from a file:// url.
    // So use XHR on webview if URL is a file URL.
    if (isFileURI(url)) {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
            // file URLs can return 0
            resolve(xhr.response);
            return;
          }
          reject(xhr.status);
        };
        xhr.onerror = reject;
        xhr.send(null);
      });
    }
    var response = await fetch(url,
      {
        credentials: 'same-origin'
      });
    if (response.ok) {
      return response.arrayBuffer();
    }
    throw new Error(response.status + ' : ' + response.url);
  };

} else {
  throw new Error('environment detection error');
}

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw 'both async and sync fetching of the wasm failed';
}

async function getWasmBinary(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary) {
    // Fetch the binary using readAsync
    try {
      var response = await readAsync(binaryFile);
      return new Uint8Array(response);
    } catch {
      // Fall back to getBinarySync below;
    }
  }

  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    throw new Error('Assertion failed' + (text ? ': ' + text: ''));
  }
}

var wasmImports = {
};

function getWasmImports() {
  // prepare imports
  return {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  }
}

var importObject = getWasmImports();
console.log("imports: \n{\n" + Object.keys(wasmImports).join(",\n") + "\n}\n");

getWasmBinary("./demo.wasm")
.then(bytes => {
  //通过浏览器提供的标准WebAssembly接口来编译和初始化一个Wasm模块
  return WebAssembly.instantiate(bytes, importObject);
})
.then(results => {
  wasm_exports = results.instance.exports;
  console.log("exports: \n{\n" + Object.keys(wasm_exports).join(",\n") + "\n}\n");
  memory = wasm_exports.memory;
  console.log('add(1, 2) = ' + wasm_exports.add(1,2))
})
.catch(e => {
  console.log(e.stack || e.toString())
})