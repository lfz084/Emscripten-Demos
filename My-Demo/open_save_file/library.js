// argument:    --js-library
// example:     em++ --js-library library.js demo.cpp -o demo.js

addToLibrary({
    js_read: function(...args) {
        return this.catchError(function(point, byteLength) {
            const buffer = new DataView(Module.HEAP8.buffer, point, byteLength);
            Module.FS_SYNC.accessHandle.read(buffer, { at: Module.FS_SYNC.offset });
            Module.FS_SYNC.seek(byteLength, 1)
        })(...args)
    },
    js_write:  function(...args) {
        return this.catchError(function(point, byteLength) {
            const buffer = new DataView(Module.HEAP8.buffer, point, byteLength);
            Module.FS_SYNC.accessHandle.write(buffer, { at: Module.FS_SYNC.offset });
            Module.FS_SYNC.seek(byteLength, 1)
        })(...args)
    },
    js_seek:  function(...args) {
        return this.catchError(function(offset, whence = 0) {
            Module.FS_SYNC.seek(offset, whence);
        })(...args)
    },
    js_truncate:  function(...args) {
        return this.catchError(function(size) {
            Module.FS_SYNC.accessHandle.truncate(size);
        })(...args)
    },
    js_getSize:  function(...args) {
        return this.catchError(function() {
            return Module.FS_SYNC.accessHandle.getSize();
        })(...args)
    }
});
