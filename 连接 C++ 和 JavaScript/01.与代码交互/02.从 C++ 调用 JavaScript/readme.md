从 C/C++ 调用 JavaScript
Emscripten 提供了两种从 C/C++ 调用 JavaScript 的主要方法：使用 emscripten_run_script() 运行脚本或编写“内联 JavaScript”。

最直接但速度稍慢的方法是使用 emscripten_run_script()。这实际上使用 eval() 从 C/C++ 运行指定的 JavaScript 代码。例如，要使用文本“hi”调用浏览器的 alert() 函数，您将调用以下 JavaScript

emscripten_run_script("alert('hi')");
注意

函数 alert 存在于浏览器中，但不存在于 node 或其他 JavaScript shell 中。更通用的替代方法是调用 console.log.

从 C 调用 JavaScript 的更快方法是编写“内联 JavaScript”，使用 EM_JS() 或 EM_ASM()（以及相关的宏）。

EM_JS 用于在 C 文件中声明 JavaScript 函数。“alert”示例可以使用 EM_JS 编写，如下所示

#include <emscripten.h>

EM_JS(void, call_alert, (), {
  alert('hello world!');
  throw 'all done';
});

int main() {
  call_alert();
  return 0;
}
EM_JS 的实现本质上是 实现 JavaScript 库 的简写。

EM_ASM 用于以类似于内联汇编代码的方式。可以使用内联 JavaScript 编写“alert”示例，如下所示

#include <emscripten.h>

int main() {
  EM_ASM(
    alert('hello world!');
    throw 'all done';
  );
  return 0;
}
编译并运行后，Emscripten 将执行这两行 JavaScript 代码，就像它们直接出现在生成的代码中一样。结果将是一个警报，然后是一个异常。（但是，请注意，在幕后，即使在这种情况下，Emscripten 仍然会进行函数调用，这会带来一定程度的开销。）

您还可以将值从 C 发送到 EM_ASM 中的 JavaScript，例如

EM_ASM({
  console.log('I received: ' + $0);
}, 100);
这将显示 I received: 100。

您还可以接收返回值，例如，以下代码将打印 I received: 100，然后打印 101

int x = EM_ASM_INT({
  console.log('I received: ' + $0);
  return $0 + 1;
}, 100);
printf("%d\n", x);
有关更多详细信息，请参阅 emscripten.h docs。

注意

您需要使用相应的宏 EM_ASM_INT、EM_ASM_DOUBLE 或 EM_ASM_PTR 指定返回值是 int、double 还是指针类型。（EM_ASM_PTR 与 EM_ASM_INT 相同，除非使用 MEMORY64，因此主要是在需要与 MEMORY64 兼容的代码中使用。）

输入值显示为 $0、$1 等。

return 用于提供从 JavaScript 发送回 C 的值。

请注意如何使用 { 和 } 将代码括起来。这是为了区分代码与稍后传递的参数，即输入值（这就是 C 宏的工作原理）。

使用 EM_ASM 宏时，确保只使用单引号 (')。双引号 (") 会导致语法错误，编译器不会检测到该错误，只有在运行有问题的代码时查看 JavaScript 控制台才能看到该错误。

clang-format 可能会破坏 Javascript 结构，例如 => 变成 = >。为了避免这种情况，请在您的 .clang-format 中添加：WhitespaceSensitiveMacros: ['EM_ASM', 'EM_JS', 'EM_ASM_INT', 'EM_ASM_DOUBLE', 'EM_ASM_PTR', 'MAIN_THREAD_EM_ASM', 'MAIN_THREAD_EM_ASM_INT', 'MAIN_THREAD_EM_ASM_DOUBLE', 'MAIN_THREAD_EM_ASM_DOUBLE', 'MAIN_THREAD_ASYNC_EM_ASM']。或者，通过在 EM_ASM 部分之前编写 // clang-format off 并在之后编写 // clang-format on 来 关闭 clang-format。