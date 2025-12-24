var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
var worker;

function catchError(callback) {
    return (...args) => {
        try { return callback(...args) }
        catch (e) { console.error(e.stack || e.message || e.toString()) }
    }
}

if (ENVIRONMENT_IS_WEB) {
    
    const CMD_WEB = {
        log: (...args) => console.log(...args),
        error: (...args) => console.error(...args),
        warn: (...args) => console.warn(...args),
        info: (...args) => console.info(...args),
        verifyPermission: async(...args) => {
            const rt = await verifyPermission(...args);
            worker.postMessage({ command: "verifyPermission", result: rt })
        }
    }
    
    worker = new Worker(document.currentScript.src);
    
    worker.onmessage = async function(e) {
        const data = e.data
        if (Array.isArray(data) && typeof CMD_WEB[data[0]] == "function") {
            const command = data.shift();
            await (catchError(CMD_WEB[command]))(...data);
        }
        else console.log(data)
    }
    
    worker.onerror = function(e) {
        e.filename && console.error(`Error:\n[ ${e.filename}:${e.lineno}:${e.colno} ]`);
        e.error && console.error(e.error);
    }
    
    async function verifyPermission(fileHandle, mode) {
        const opt = { mode };
        if ((await fileHandle.queryPermission(opt)) === "granted") {
            return true;
        }
        if ((await fileHandle.requestPermission(opt)) === "granted") {
            return true;
        }
        return false;
    }
    
} else
if (ENVIRONMENT_IS_WORKER) {
    
    console.log = (...args) => postMessage(["log", ...args])
    console.error = (...args) => postMessage(["error", ...args])
    console.warn = (...args) => postMessage(["warn", ...args])
    console.info = (...args) => postMessage(["info", ...args])
    
    const CMD_WORKER = {
        openFile: async (handle) => {
            await FS_SYNC["openFile"](handle);
            Module["_readFile"]();
        },
        saveFile: async (handle) => {
            Module["_writeFile"]();
            await FS_SYNC["saveFile"](handle);
        }
    };
    
    let sourceFileHandle;
    let cacheFileHandle;
    let _accessHandle;
    let _offset;
    
    const FS_SYNC = {
        load: async function() {
            if (!checkFileHandle(sourceFileHandle)) return;
            if (!(await verifyPermission(sourceFileHandle, "read"))) return;

            const file = await sourceFileHandle.getFile();
            const readableStream = file.stream();
            const reader = readableStream.getReader({ mode: "byob" });
            let buffer = new ArrayBuffer(1024 * 1024 * 2);

            _accessHandle.truncate(0);
            await readStream(reader);
            _accessHandle.flush();

            function readStream(reader) {
                let offset = 0;
                let bytesReceived = 0;
                return reader
                    .read(new Uint8Array(buffer))
                    .then(function processText({ done, value }) {
                        if (done) {
                            postMessage(`load() complete. Total bytes: ${bytesReceived}`);
                            return;
                        }
                        _accessHandle.write(value, { at: offset });
                        buffer = value.buffer;
                        offset += value.byteLength;
                        bytesReceived += value.byteLength;
                        if (!(offset & 0x1FFFFFF)) {
                            postMessage(`flush Total bytes: ${bytesReceived}`);
                            _accessHandle.flush();
                        }
                        return reader
                            .read(new Uint8Array(buffer))
                            .then(processText);
                    });
            }
        },
        save: async function() {
            if (!checkFileHandle(sourceFileHandle)) return;
            if (!(await verifyPermission(sourceFileHandle, "readwrite"))) return;

            let chunk;
            let position = 0;
            let chunkSize = 1024 * 1024 * 2;
            const writableStream = await sourceFileHandle.createWritable();
            const size = _accessHandle.getSize();

            await writableStream.truncate(0);
            while (size - position > 0) {
                chunkSize = Math.min(chunkSize, size - position);
                chunk = new DataView(new ArrayBuffer(chunkSize));
                _accessHandle.read(chunk, { at: position });
                await writableStream.write(chunk);
                position += chunkSize;
                !(position & 0x1FFFFFF) && postMessage(`write Total bytes: ${position}`);
            }

            await writableStream.close();
            postMessage(`save() complete. Total bytes: ${position}`);
        },
        openFile: async function(fileHandle) {
            sourceFileHandle = fileHandle;
            postMessage(`openFile: ${sourceFileHandle.name}`);
            await this.load();
        },
        saveFile: async function(fileHandle) {
            sourceFileHandle = fileHandle;
            postMessage(`saveFile: ${sourceFileHandle.name}`);
            await this.save();
        },
        getSize: function() {
            return _accessHandle.getSize();
        },
        seek: function(offset, whence = 0) {
            const end = _accessHandle.getSize();
            switch(whence) {
                case 0:
                    _offset = 0 + offset;
                    break;
                case 1:
                    _offset = _offset + offset;
                    break;
                case 2:
                    _offset = end + offset;
                    break;
            }
            _offset = Math.max(0, _offset)
        },
        truncate: function(size) {
            _accessHandle.truncate(size);
        },
        read: async function(position, byteLength) {
            const buffer = new DataView(new ArrayBuffer(byteLength));
            _accessHandle.read(buffer, { at: position });
            postMessage(new TextDecoder().decode(buffer));
        },
        write: async function(string, position) {
            position === undefined && (position = _accessHandle.getSize());
            _accessHandle.write(new TextEncoder().encode(string), { at: position });
            postMessage(`write: "${string}" position ${position}`);
        },
        get offset() { return _offset; },
        get accessHandle() { return _accessHandle }
    }

    onmessage = catchError(commandMessage)

    async function commandMessage(e) {
        let arr;
        const data = e.data;
        if (!Array.isArray(data) && typeof data !== "string") {
            return;
        }
        if (typeof data === "string") {
            arr = data.split(/\s+/);
        }
        else {
            arr = data.slice(0);
        }
        
        const command = arr.shift();
        if (CMD_WORKER[command]) await (catchError(CMD_WORKER[command]))(...arr);
        else postMessage(`No command "${command}" found`)
    }

    function checkFileHandle(fileHandle) {
        if (fileHandle && fileHandle.constructor.name == "FileSystemFileHandle") {
            return true;
        }
        else {
            postMessage(`no FileSystemFileHandle`);
            return false;
        }
    }

    async function verifyPermission(fileHandle, mode) {
        return new Promise((resolve) => {
            function promiseMessage(e) {
                const data = e.data;
                if (typeof data === "object") {
                    const { command, result } = data;
                    if (command === "verifyPermission") {
                        removeEventListener("message", promiseMessage);
                        !result && postMessage(`no ${mode} permission`);
                        resolve(result);
                    }
                }
            }
            addEventListener("message", promiseMessage);
            postMessage(["verifyPermission", fileHandle, mode]);
        })
    }
    
    async function init() {
        postMessage("init worker...");
        const root = await navigator.storage.getDirectory();
        cacheFileHandle = await root.getFileHandle("cache", { create: true });
        _accessHandle = await cacheFileHandle.createSyncAccessHandle();
        _offset = 0;
        postMessage("workerReady")
    }
    
    (catchError(init))();
    
    var Module = {
        onRuntimeInitialized: catchError(() => {
            postMessage("wasmReady");
            postMessage("Module_API = " + JSON.stringify(Object.keys(Module), null, 2));
        }),
        FS_SYNC
    }
    
    catchError(function() {
      postMessage("init WebAssembly...");
      importScripts("./demo.js");
    })()
    
}