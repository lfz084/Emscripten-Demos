addToLibrary({
    input: function(ptr, length) {
        const end = Math.min(length, Module.bufSize);
        for (let i = 0; i < end; i++) Module.HEAPU8[ptr + i] = Module.source[i]+1
    },
    output: function(ptr, length) {
        const end = Math.min(length, Module.bufSize);
        for (let i = 0; i < end; i++) Module.target[i] = Module.HEAPU8[ptr + i]
    },
    print: function() {
        alert(Module.target.toString())
    }
});