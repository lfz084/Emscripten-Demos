const _IS_WEB = typeof window == 'object';
const _IS_WORKER = typeof WorkerGlobalScope != 'undefined';

if (_IS_WEB) {
    const CMD = {
        print: (m) => document.body.innerText += `${m}\n`,
        alert: (m) => alert(m)
    };
    const url = document.currentScript.src;
    const wk = new Worker(url);
    wk.onmessage = function(e) {
        const d = e.data;
        typeof CMD[d.command] == "function" && CMD[d.command](...d.args);
    }
    wk.onerror = function(e) {
        CMD["print"](e.error);
    }
    CMD["print"](`create Worker: ${url} is ${wk}`);
} else
if (_IS_WORKER) {
    const bufSize = 8 << 10;
    const inputData = new TextEncoder().encode("this is utf-8 string");
    const outputData = new Uint8Array(bufSize);
    
    var Module = {
        onRuntimeInitialized: catchError(() => {
            alertModuleKeys();
            Module._test_iodata();
            Module.print("javascript output data from wasm:")
            Module.print(new TextDecoder().decode(outputData));
        }),
        print: m => postMessage({command: "print", args: [m]}),
        inputData,
        outputData
    }
    
    function alertModuleKeys() { 
        postMessage({
            command: "alert",
            args: [JSON.stringify(Object.keys(Module), null, 2)]
        }) 
    }
    
    function catchError(callback) { 
        return () => { 
            try { callback() }
            catch (e) { 
                postMessage({ 
                    command: "print",
                    args: [e.stack || e.toString()]
                })
            }
        } 
    }
    
    onmessage = function(e) {
        
    }
    
    onerror = function(e) {
        
    }
    
    importScripts("demo.js")
}