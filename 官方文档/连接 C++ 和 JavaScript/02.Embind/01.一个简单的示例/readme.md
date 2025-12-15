一个简单的示例
以下代码使用 EMSCRIPTEN_BINDINGS() 块将简单的 C++ lerp() function() 公开到 JavaScript。

// quick_example.cpp
#include <emscripten/bind.h>

using namespace emscripten;

float lerp(float a, float b, float t) {
    return (1 - t) * a + t * b;
}

EMSCRIPTEN_BINDINGS(my_module) {
    function("lerp", &lerp);
}
要使用 embind 编译上述示例，我们需要使用 bind 选项调用 emcc

emcc -lembind -o quick_example.js quick_example.cpp
生成的 quick_example.js 文件可以作为节点模块加载，也可以通过 <script> 标记加载

<!doctype html>
<html>
  <script>
    var Module = {
      onRuntimeInitialized: function() {
        console.log('lerp result: ' + Module.lerp(1, 2, 0.5));
      }
    };
  </script>
  <script src="quick_example.js"></script>
</html>
注意

我们使用 onRuntimeInitialized 回调在运行时准备就绪时运行代码，这是一个异步操作（为了编译 WebAssembly）。

注意

打开开发者工具控制台以查看 console.log 的输出。

在 EMSCRIPTEN_BINDINGS() 块中的代码在 JavaScript 文件最初加载时运行（与全局构造函数同时）。embind 会自动推断函数 lerp() 的参数类型和返回类型。

embind 公开的所有符号都可以在 Emscripten Module 对象上找到。

重要

始终如上所示通过 Module 对象 对象访问对象。

虽然这些对象默认情况下也存在于全局命名空间中，但在某些情况下它们将不存在（例如，如果你使用 Closure 编译器 来压缩代码或将编译后的代码包装在一个函数中以避免污染全局命名空间）。当然，你可以使用你喜欢的任何名称来命名模块，方法是将其分配给一个新变量：var MyModuleName = Module;。