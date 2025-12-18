//xhr_wrap2.pkg
mergeInto(LibraryManager.library, {
    XHRGet: function (url, cb) {
        return JS_XHRGet(Pointer_stringify(url), cb);
    },
})