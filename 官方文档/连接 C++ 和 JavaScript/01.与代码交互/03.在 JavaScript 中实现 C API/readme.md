在 JavaScript 中实现 C API
可以在 JavaScript 中实现 C API！这是 Emscripten 的许多库（如 SDL1 和 OpenGL）中使用的方法。

您可以使用它从 C/C++ 编写自己的 API。为此，您定义接口，使用 extern 装饰以将 API 中的方法标记为外部符号。然后，您只需在 library.js（默认情况下）中添加其定义即可在 JavaScript 中实现这些符号。编译 C 代码时，编译器会在 JavaScript 库中查找相关的外部符号。

默认情况下，实现将添加到 library.js 中（这就是您在其中找到 Emscripten 的 libc 部分的地方）。您可以将 JavaScript 实现放在您自己的库文件中，并使用 emcc 选项 --js-library 添加它。有关完整的示例，包括您应在 JavaScript 库文件中使用的语法，请参阅 test/test_other.py 中的 test_js_libraries。

作为一个简单的例子，考虑以下 C 代码

extern void my_js(void);

int main() {
  my_js();
  return 1;
}
注意

使用 C++ 时，应将 extern void my_js(); 封装在 extern "C" {} 块中，以防止 C++ 命名修饰

extern "C" {
  extern void my_js();
}
然后，您可以通过简单地将实现添加到 **library.js**（或您自己的文件）中，在 JavaScript 中实现 my_js。就像我们从 C 调用 JavaScript 的其他示例一样，下面的示例只是使用简单的 alert() 函数创建一个对话框。

my_js: function() {
  alert('hi');
},
如果您将其添加到您自己的文件中，您应该编写类似以下内容

addToLibrary({
  my_js: function() {
    alert('hi');
  },
});
addToLibrary 将输入对象的属性复制到 LibraryManager.library（所有 JavaScript 库代码所在的全局对象）。在本例中，它将一个名为 my_js 的函数添加到此对象上。