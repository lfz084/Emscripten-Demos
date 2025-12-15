// console.h
// 函数
// void emscripten_console_log(const char *utf8String)
// 使用 console.log() 打印字符串。

// 参数
// utf8String – 以 UTF-8 编码的字符串。

// void emscripten_console_warn(const char *utf8String)
// 使用 console.warn() 打印字符串。

// 参数
// utf8String – 以 UTF-8 编码的字符串。

// void emscripten_console_error(const char *utf8String)
// 使用 console.error() 打印字符串。

// 参数
// utf8String – 以 UTF-8 编码的字符串。

// void emscripten_out(const char *utf8String)
// 使用 out() JS 函数打印字符串，默认情况下会写入控制台（或 stdout），但可以通过 Module 对象上的 print 属性覆盖。

// 参数
// utf8String – 以 UTF-8 编码的字符串。

// void emscripten_err(const char *utf8String)
// 使用 err() JS 函数打印字符串，默认情况下会写入控制台（或 stderr），但可以通过 Module 对象上的 printErr 属性覆盖。

// 参数
// utf8String – 以 UTF-8 编码的字符串。

// void emscripten_dbg(const char *utf8String)
// 使用 dbg() JS 函数打印字符串，它会写入控制台（或 stdout）。与 dbg() JS 函数一样，此符号仅在调试构建中可用（即链接到 -sASSERTIONS 或等效的 -O0 时）。

// 参数
// utf8String – 以 UTF-8 编码的字符串。

#include <emscripten/console.h>

int main() {
    emscripten_console_log("emscripten_console_log");
    emscripten_console_warn("emscripten_console_warn");
    emscripten_console_error("emscripten_console_error");
    emscripten_out("emscripten_out");
    emscripten_err("emscripten_err");
    emscripten_dbg("emscripten_dbg");
    return 0;
}