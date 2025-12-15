// argument:    --js-library
// example:     em++ --js-library library.js demo.cpp -o demo.js

addToLibrary({
    input: function(ptr, length) {
        const end = Math.min(length, Module.inputData.length);
        for (let i = 0; i < end; i++) Module.HEAPU8[ptr + i] = Module.inputData[i]
    },
    output: function(ptr, length) {
        const end = Math.min(length, Module.outputData.length);
        for (let i = 0; i < end; i++) Module.outputData[i] = Module.HEAPU8[ptr + i]
    }
});
