#include <emscripten/emscripten.h>

// 从 JavaScript 调用编译后的 C 函数
// ccall(ident, returnType, argTypes, args, opts)
// 从 JavaScript 调用编译后的 C 函数。

// 该函数从 JavaScript 执行编译后的 C 函数并返回结果。C++ 名称改编意味着无法调用“普通”C++ 函数；该函数必须在 .c 文件中定义，或者是在使用 extern "C" 定义的 C++ 函数。

// returnType 和 argTypes 允许您指定参数和返回值的类型。可能的类型是 "number"、"string"、"array" 或 "boolean"，它们对应于适当的 JavaScript 类型。对于任何数字类型或 C 指针，使用 "number"，对于表示字符串的 C char*，使用 string，对于布尔类型，使用 "boolean"，对于 JavaScript 数组和类型化数组，使用 "array"，它们包含 8 位整数数据 - 也就是说，数据被写入 C 数组的 8 位整数中；特别是如果您在这里提供类型化数组，它必须是 Uint8Array 或 Int8Array。如果您想接收其他类型数据的数组，您可以手动分配内存并写入它，然后在这里提供一个指针（作为 "number"，因为指针只是数字）。

extern "C" {
    
EMSCRIPTEN_KEEPALIVE int c_add(int num1, int num2) {
    return num1 + num2;
}

}

/*
// Call C from JavaScript
var result = Module.ccall('c_add', // name of C function
  'number', // return type
  ['number', 'number'], // argument types
  [10, 20]); // arguments

// result is 30
*/

// 注意

// ccall 使用 C 堆栈用于临时值。如果您传递字符串，那么它只在调用完成之前“存活”。如果被调用的代码保存了该指针以供将来使用，它可能会指向无效数据。

// 如果您需要一个永久存在的字符串，您可以创建它，例如，使用 _malloc 和 stringToUTF8()。但是，您必须随后手动删除它！

// LLVM 优化可以内联和删除函数，之后您将无法调用它们。类似地，由 Closure Compiler 最小化的函数名是不可访问的。在任何一种情况下，解决方案是在您调用 emcc 时将函数添加到 EXPORTED_FUNCTIONS 列表中。

// -sEXPORTED_FUNCTIONS=_main,_myfunc"
//（请注意，我们还导出了 main - 如果我们没有这样做，编译器会假设我们不需要它。）导出的函数随后可以像平常一样被调用

// a_result = Module.ccall('myfunc', 'number', ['number'], [10])
// 参数
// ident – 要调用的 C 函数的名称。

// returnType – 函数的返回类型。请注意，不支持 array，因为我们没有办法知道数组的长度。对于 void 函数，这可以是 null（注意：是 JavaScript null 值，而不是包含单词“null”的字符串）。

// 注意

// 64 位整数变为两个 32 位参数，分别用于低位和高位（因为 64 位整数无法用 JavaScript 数字表示）。

// 参数
// argTypes – 函数参数类型的数组（如果没有参数，可以省略）。

// args – 函数参数的数组，作为本机 JavaScript 值（如 returnType 中所示）。请注意，字符串参数将存储在堆栈上（JavaScript 字符串将成为堆栈上的 C 字符串）。

// 返回值
// 函数调用的结果，作为本机 JavaScript 值（如 returnType 中所示），或者如果设置了 async 选项，则为结果的 JavaScript Promise。

// Opts
// 可选的选项对象。它可以包含以下属性

// async: 如果为 true，则表示 ccall 将执行异步操作。这假设您使用 asyncify 支持进行构建。

// 注意

// 异步调用目前不支持 promise 错误处理。

// cwrap(ident, returnType, argTypes)
// 返回 C 函数的本机 JavaScript 包装器。

// 这类似于 ccall()，但返回一个 JavaScript 函数，该函数可以根据需要多次重用。C 函数可以在 C 文件中定义，或者是在使用 extern "C" 定义的 C 兼容 C++ 函数（以防止名称改编）。

/*
// Call C from JavaScript
var c_javascript_add = Module.cwrap('c_add', // name of C function
  'number', // return type
  ['number', 'number']); // argument types

// Call c_javascript_add normally
console.log(c_javascript_add(10, 20)); // 30
console.log(c_javascript_add(20, 30)); // 50
*/

// 注意

// cwrap 使用 C 堆栈用于临时值。如果您传递字符串，那么它只在调用完成之前“存活”。如果被调用的代码保存了该指针以供将来使用，它可能会指向无效数据。如果您需要一个永久存在的字符串，您可以创建它，例如，使用 _malloc 和 stringToUTF8()。但是，您必须随后手动删除它！

// 要包装函数，必须通过在您调用 emcc 时将其添加到 EXPORTED_FUNCTIONS 列表中来导出它。如果函数没有导出，优化可能会将其删除，并且 cwrap 将无法在运行时找到它。（在启用了 ASSERTIONS 的构建中，cwrap 将在这种情况下显示错误；在没有断言的发布构建中，尝试包装不存在的函数将出现错误，要么返回 undefined，要么返回一个在实际调用时将出现错误的函数，具体取决于 cwrap 的优化方式。）

// cwrap 实际上并没有调用编译后的代码（只有调用它返回的包装器才会这样做）。这意味着在运行时完全初始化之前（当然，调用返回的包装函数必须等待运行时，就像在一般情况下调用编译后的代码一样），可以安全地尽早调用 cwrap。

// -sEXPORTED_FUNCTIONS=_main,_myfunc
// 导出函数可以像普通函数一样调用

// my_func = Module.cwrap('myfunc', 'number', ['number'])
// my_func(12)
// 参数
// ident – 要调用的 C 函数的名称。

// returnType – 函数的返回类型。可以是 "number"、"string" 或 "array"，它们对应于适当的 JavaScript 类型（对于任何 C 指针，使用 "number"，对于 JavaScript 数组和类型化数组，使用 "array"；请注意，数组是 8 位），对于 void 函数，它可以是 null（注意：JavaScript null 值，而不是包含“null”一词的字符串）。

// argTypes – 函数参数类型的数组（如果没有参数，可以省略）。类型与 returnType 中的类型相同，只是 array 不受支持，因为我们无法知道数组的长度。

// opts – 可选的选项对象，请参见 ccall()。

// 返回值
// 可以用来运行 C 函数的 JavaScript 函数。

// 访问内存
// setValue(ptr, value, type[, noSafe])
// 在运行时将特定内存地址处的某个值设置好。

// 注意

// setValue() 和 getValue() 只能进行对齐写入和读取。

// type 是一个 LLVM IR 类型（i8、i16、i32、i64、float、double 中的一个，或者像 i8* 或仅 * 这样的指针类型），而不是 ccall() 或 cwrap() 中使用的 JavaScript 类型。这是一个更低级的操作，我们需要关注正在使用的具体类型。

// 参数
// ptr – 表示内存地址的指针（数字）。

// value – 要存储的值

// type – 一个 LLVM IR 类型，以字符串形式表示（见上面的“注意”）。

// noSafe (bool) – 开发人员应忽略此变量。它仅在 SAFE_HEAP 编译模式下使用，在这种模式下，它可以帮助避免在某些特殊用例中出现无限递归。

// getValue(ptr, type[, noSafe])
// 在运行时获取特定内存地址处的某个值。

// 注意

// setValue() 和 getValue() 只能进行对齐写入和读取！

// type 是一个 LLVM IR 类型（i8、i16、i32、i64、float、double 中的一个，或者像 i8* 或仅 * 这样的指针类型），而不是 ccall() 或 cwrap() 中使用的 JavaScript 类型。这是一个更低级的操作，我们需要关注正在使用的具体类型。

// 参数
// ptr – 表示内存地址的指针（数字）。

// type – 一个 LLVM IR 类型，以字符串形式表示（见上面的“注意”）。

// noSafe (bool) – 开发人员应忽略此变量。它仅在 SAFE_HEAP 编译模式下使用，在这种模式下，它可以帮助避免在某些特殊用例中出现无限递归。

// 返回值
// 存储在指定内存地址处的值。

// 转换函数 - 字符串、指针和数组
// UTF8ToString(ptr[, maxBytesToRead])
// 给定一个指向 Emscripten HEAP 中以空终止的 UTF8 编码字符串的指针 ptr，返回该字符串的副本，作为 JavaScript String 对象。

// 参数
// ptr – 指向 Emscripten HEAP 中以空终止的 UTF8 编码字符串的指针。

// maxBytesToRead – 一个可选的长度，指定要读取的最大字节数。可以省略此参数来扫描字符串，直到第一个 0 字节。如果传递了 maxBytesToRead，并且 [ptr, ptr+maxBytesToReadr) 中的字符串在中间包含一个空字节，则该字符串将在该字节索引处被截断（即 maxBytesToRead 不会生成一个长度精确为 [ptr, ptr+maxBytesToRead) 的字符串）请注意，频繁地使用 UTF8ToString()（带有和不带有 maxBytesToRead）可能会扰乱 JS JIT 优化，因此值得考虑始终如一地使用其中一种风格。

// 返回值
// 一个 JavaScript String 对象

// stringToUTF8(str, outPtr, maxBytesToWrite)
// 将给定的 JavaScript String 对象 str 复制到 Emscripten HEAP 的地址 outPtr，以空终止，并以 UTF8 形式编码。

// 复制将最多需要 str.length*4+1 字节的 HEAP 空间。可以使用 lengthBytesUTF8() 函数计算对字符串进行编码所需的精确字节数（不包括空终止符）。

// 参数
// str (String) – 一个 JavaScript String 对象。

// outPtr – 指向从 str 复制的数据的指针，以 UTF8 格式编码，并以空终止。

// maxBytesToWrite – 此函数最多可以写入的字节数限制。如果字符串比此更长，则输出将被截断。即使发生截断，输出的字符串也将始终以空终止，只要 maxBytesToWrite > 0。

// UTF16ToString(ptr)
// 给定一个指向 Emscripten HEAP 中以空终止的 UTF16LE 编码字符串的指针 ptr，返回该字符串的副本，作为 JavaScript String 对象。

// 参数
// ptr – 指向 Emscripten HEAP 中以空终止的 UTF16LE 编码字符串的指针。

// 返回值
// 一个 JavaScript String 对象

// stringToUTF16(str, outPtr, maxBytesToWrite)
// 将给定的 JavaScript String 对象 str 复制到 Emscripten HEAP 的地址 outPtr，以空终止，并以 UTF16LE 形式编码。

// 复制将需要 HEAP 中的 (str.length+1)*2 字节空间。

// 参数
// str (String) – 一个 JavaScript String 对象。

// outPtr – 指向从 str 复制的数据的指针，以 UTF16LE 格式编码，并以空终止。

// maxBytesToWrite – 此函数最多可以写入的字节数限制。如果字符串比此更长，则输出将被截断。即使发生截断，输出的字符串也将始终以空终止，只要 maxBytesToWrite >= 2，以便有空间用于空终止符。

// UTF32ToString(ptr)
// 给定一个指向 Emscripten HEAP 中以空终止的 UTF32LE 编码字符串的指针 ptr，返回该字符串的副本，作为 JavaScript String 对象。

// 参数
// ptr – 指向 Emscripten HEAP 中以空终止的 UTF32LE 编码字符串的指针。

// 返回值
// 一个 JavaScript String 对象。

// stringToUTF32(str, outPtr, maxBytesToWrite)
// 将给定的 JavaScript String 对象 str 复制到 Emscripten HEAP 的地址 outPtr，以空终止，并以 UTF32LE 形式编码。

// 复制将最多需要 (str.length+1)*4 字节的 HEAP 空间，但可以使用更少的空间，因为 str.length 不会返回字符串中字符的数量，而是返回字符串中 UTF-16 代码单元的数量。可以使用 lengthBytesUTF32() 函数计算对字符串进行编码所需的精确字节数（不包括空终止符）。

// 参数
// str (String) – 一个 JavaScript String 对象。

// outPtr – 指向从 str 复制的数据的指针，以 UTF32LE 格式编码，并以空终止。

// maxBytesToWrite – 此函数最多可以写入的字节数限制。如果字符串比此更长，则输出将被截断。即使发生截断，输出的字符串也将始终以空终止，只要 maxBytesToWrite >= 4，以便有空间用于空终止符。

// AsciiToString(ptr)
// 将 ASCII 或 Latin-1 编码字符串转换为 JavaScript String 对象。

// 参数
// ptr – 要转换为 String 的指针。

// 返回值
// 一个 JavaScript String，包含来自 ptr 的数据。

// 返回值类型
// String

// intArrayFromString(stringy, dontAddNull[, length])
// 这会将 JavaScript 字符串转换为以 0 结尾的 C 行数字数组。

// 参数
// stringy (String) – 要转换的字符串。

// dontAddNull (bool) – 如果 true，则新数组不会以零结尾。

// 长度 – 数组的长度（可选）。

// 返回值
// 从 stringy 创建的数组。

// intArrayToString(array)
// 这将从一个以零结尾的 C 行数字数组创建一个 JavaScript 字符串。

// 参数
// array – 要转换的数组。

// 返回值
// 一个 String，包含 array 的内容。

// writeArrayToMemory(array, buffer)
// 将数组写入堆中的指定地址。请注意，在写入数组之前，应该为数组分配内存。

// 参数
// array – 要写入内存的数组。

// buffer (Number) – array 要写入的地址（数字）。

// 运行依赖项
// 请注意，通常运行依赖项由文件打包器和系统的其他部分管理。开发人员很少直接使用此 API。

// addRunDependency(id)
// 将 id 添加到运行依赖项列表中。

// 这将添加一个运行依赖项并增加运行依赖项计数器。

// 参数
// id (String) – 代表操作的任意 ID。

// removeRunDependency(id)
// 从运行依赖项列表中删除指定的 id。

// 参数
// id (String) – 要删除的特定依赖项的标识符（使用 addRunDependency() 添加）。

// 堆栈跟踪
// stackTrace()
// 返回当前堆栈跟踪。

// 注意

// 堆栈跟踪至少在 IE10 和 Safari 6 中不可用。

// 返回值
// 当前堆栈跟踪（如果可用）。

// 内存模型的类型访问器
// Emscripten 内存表示 使用类型化数组缓冲区 (ArrayBuffer) 来表示内存，其中不同的视图可以访问不同的类型。用于访问不同类型内存的视图列在下面。

// HEAP8
// 8 位有符号内存的视图。

// HEAP16
// 16 位有符号内存的视图。

// HEAP32
// 32 位有符号内存的视图。

// HEAPU8
// 8 位无符号内存的视图。

// HEAPU16
// 16 位无符号内存的视图。

// HEAPU32
// 32 位无符号内存的视图。

// HEAPF32
// 32 位浮点内存的视图。

// HEAPF64
// 64 位浮点内存的视图。