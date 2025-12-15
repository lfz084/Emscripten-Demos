要编译此代码，请在 Emscripten 主目录中运行以下命令

emcc test/hello_function.cpp -o function.html -sEXPORTED_FUNCTIONS=_int_sqrt -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
EXPORTED_FUNCTIONS 告诉编译器我们希望从编译后的代码中访问什么（如果未使用，其他所有内容可能会被删除），而 EXPORTED_RUNTIME_METHODS 告诉编译器我们希望使用运行时函数 ccall 和 cwrap（否则它不会包含它们）。

注意

EXPORTED_FUNCTIONS 会影响编译到 JavaScript。如果您先编译到目标文件，然后将目标文件编译到 JavaScript，则需要在第二个命令中使用该选项。如果您像本例中这样一起执行（源代码直接到 JavaScript），那么它当然可以使用。

编译后，您可以使用以下 JavaScript 使用 cwrap() 调用此函数

int_sqrt = Module.cwrap('int_sqrt', 'number', ['number'])
int_sqrt(12)
int_sqrt(28)
第一个参数是要包装的函数的名称，第二个是函数的返回类型（如果没有，则为 JavaScript null 值），第三个是参数类型的数组（如果没有参数，则可以省略）。类型为“number”（对于对应于 C 整数、浮点数或通用指针的 JavaScript 数字）、“string”（对于对应于 C char* 的 JavaScript 字符串，该字符串表示一个字符串）或“array”（对于对应于 C 数组的 JavaScript 数组或类型化数组；对于类型化数组，它必须是 Uint8Array 或 Int8Array）。

您可以通过首先在 Web 浏览器中打开生成的页面 **function.html** 来自己运行它（页面加载时不会发生任何事情，因为没有 main()）。打开一个 JavaScript 环境（Firefox 上为 **Control-Shift-K**，Chrome 上为 **Control-Shift-J**），并将以上命令作为三个独立的命令输入，在每个命令之后按 **Enter**。您应该获得结果 3 和 5 - 这些输入使用 C++ 整数数学的预期输出。

ccall() 类似，但接收另一个参数，其中包含要传递给函数的参数

// Call C from JavaScript
var result = Module.ccall('int_sqrt', // name of C function
  'number', // return type
  ['number'], // argument types
  [28]); // arguments

// result is 5
注意

此示例说明了其他几点，在使用 ccall() 或 cwrap() 时，您应该记住这些要点

这些方法可以与编译后的 **C** 函数一起使用 - 命名修饰后的 C++ 函数将无法使用。

我们强烈建议您导出要从 JavaScript 调用的函数

导出是在编译时完成的。例如：-sEXPORTED_FUNCTIONS=_main,_other_function 导出 main() 和 other_function()。

请注意，您需要在 EXPORTED_FUNCTIONS 列表中的函数名称开头添加 _。

请注意，该列表中提到了 _main。如果您没有它，编译器将将其作为死代码消除。导出的函数列表是将保持存活的**整个**列表（除非其他代码以其他方式保持存活）。

Emscripten 执行 死代码消除 以最小化代码大小 - 导出确保您需要的函数不会被删除。

在更高优化级别（-O2 及更高版本）下，代码会进行压缩，包括函数名称。导出函数使您可以继续使用全局 Module 对象通过原始名称访问它们。

如果您要导出 JS 库函数（例如，来自 src/library*.js 文件中的某个函数），那么除了 EXPORTED_FUNCTIONS 之外，您还需要将其添加到 DEFAULT_LIBRARY_FUNCS_TO_INCLUDE 中，因为后者将强制将该方法实际包含在构建中。

编译器将删除它没有看到使用的代码，以改善代码大小。如果您在编译器可以看到的地方使用 ccall，例如 --pre-js 或 --post-js 中的代码，它就可以正常工作。如果您在编译器没有看到的地方使用它，例如 HTML 上的另一个脚本标签或 JS 控制台中（就像我们在本教程中所做的那样），那么由于优化和压缩，您应该从运行时导出 ccall，使用 EXPORTED_RUNTIME_METHODS，例如使用 -sEXPORTED_RUNTIME_METHODS=ccall,cwrap，并在 Module 上调用它（它包含所有导出的内容，以一种不受压缩或优化影响的安全方式）。