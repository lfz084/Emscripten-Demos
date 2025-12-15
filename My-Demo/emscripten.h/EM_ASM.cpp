#include <iostream>
#include <emscripten/emscripten.h>
// EM_ASM(...)
// 用于内联汇编/JavaScript 的便捷语法。

// 这允许您在 C 代码中“内联”声明 JavaScript，然后在编译后的代码在浏览器中运行时执行它。例如，以下 C 代码如果用 Emscripten 编译并在浏览器中运行，将显示两个警报

/*
int main() {
    EM_ASM(alert('hai'); alert('bai'));
    return 0;
}
*/

// 参数可以传递到 JavaScript 代码块中，它们在那里作为变量 $0、$1 等出现。这些参数可以是 int32_t 或 double 类型。

/*
int main() {
    EM_ASM({
    console.log('I received: ' + [$0, $1]);
    }, 100, 35.5);
    return 0;
}
*/

// 请注意 { 和 }。

// 以 null 结尾的 C 字符串也可以传递到 EM_ASM 块中，但要对它们进行操作，需要将它们从堆中复制出来以转换为高级 JavaScript 字符串。
// 编译命令要加上 -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$UTF8ToString'

/*
int main() {
    const char* word = "world!";
    EM_ASM(console.log('hello ' + UTF8ToString($0)), word);
    return 0;
}
*/

// 以相同的方式，可以将指向任何类型（包括 void *）的指针传递到 EM_ASM 代码中，它们在那里显示为整数，就像上面的 char * 指针一样。可以通过直接读取堆来管理对数据的访问。

/*
int main() {
    int arr[2] = { 30, 45 };
    EM_ASM({
        console.log('Data: ' + HEAP32[$0>>2] + ', ' + HEAP32[($0+4)>>2]);
    }, arr);
}
*/

// 注意
// 从 Emscripten 1.30.4 开始，EM_ASM 代码块的内容出现在正常的 JS 文件中，因此 Closure 编译器和其他 JavaScript 缩减器将能够对它们进行操作。您可能需要在某些地方使用安全引号 (a['b'] 而不是 a.b) 以避免缩减发生。
// C 预处理器不了解 JavaScript 令牌，因此如果 code 块包含逗号字符 ,，则可能需要将代码块括在圆括号中。例如，代码 EM_ASM(return [1,2,3].length); 无法编译，但 EM_ASM((return [1,2,3].length)); 可以。

// EM_ASM_INT(code, ...)
// 此宏以及 EM_ASM_DOUBLE 和 EM_ASM_PTR 的行为类似于 EM_ASM，但此外它们还将值返回给 C 代码。输出值使用 return 语句传回

/*
int main() {
    int x = EM_ASM_INT({
        return $0 + 42;
    }, 100);
    
    int y = EM_ASM_INT(return HEAP8.length);
    
    std::cout << "x: " << x << ", y: " << y << std::endl;
    return 0;
}
*/

// EM_ASM_PTR(code, ...)
// 类似于 EM_ASM_INT，但用于指针大小的返回值。当使用 -sMEMORY64 构建时，这将导致 i64 返回值，否则将导致 i32 返回值。

// 字符串可以从 JavaScript 返回到 C，但需要小心内存管理。
// 编译命令要加上 -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$stringToNewUTF8,$lengthBytesUTF8'

int main() {
    char *str = (char*)EM_ASM_PTR({
        var jsString = 'Hello with some exotic Unicode characters: Tässä on yksi lumiukko: ☃, ole hyvä.';
        var lengthBytes = lengthBytesUTF8(jsString)+1;
        // 'jsString.length' would return the length of the string as UTF-16
        // units, but Emscripten C strings operate as UTF-8.
        return stringToNewUTF8(jsString);
    });
    printf("UTF8 string says: %s\n", str);
    free(str); // Each call to _malloc() must be paired with free(), or heap memory will leak!
}

// EM_ASM_DOUBLE(code, ...)
// 类似于 EM_ASM_INT，但用于 double 返回值。

// MAIN_THREAD_EM_ASM(code, ...)
// 此宏的行为类似于 EM_ASM，但它在主线程上执行调用。这在 pthreads 构建中很有用，当您想要从 pthread 与 DOM 交互时；这基本上为您代理了调用。

// 此调用以同步方式代理到主线程，也就是说，执行将在主线程完成运行 JS 后恢复。同步代理也使返回值成为可能，请参见接下来的两个变体。

// MAIN_THREAD_EM_ASM_INT(code, ...)
// 类似于 MAIN_THREAD_EM_ASM，但返回一个 int 值。

// MAIN_THREAD_EM_ASM_DOUBLE(code, ...)
// 类似于 MAIN_THREAD_EM_ASM，但返回一个 double 值。

// MAIN_THREAD_EM_ASM_PTR(code, ...)
// 类似于 MAIN_THREAD_EM_ASM，但返回一个指针值。

// MAIN_THREAD_ASYNC_EM_ASM(code, ...)
// 类似于 MAIN_THREAD_EM_ASM，但以 **异步** 方式代理，也就是说，主线程将收到一个请求来运行代码，并且将在它可以的时候运行它；工作线程不会等待。 （请注意，如果在主线程上调用它，则没有任何内容需要代理，并且 JS 会立即同步执行。）