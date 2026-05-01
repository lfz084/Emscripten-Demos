1 休眠/让出控制权给事件循环

sleep.cpp
  
你可以使用 -sASYNCIFY 或 -sJSPI 编译它

emcc -O3 sleep.cpp -s<ASYNCIFY or JSPI>
注意

使用 Asyncify 时，进行优化 (-O3) 非常重要，因为未优化的版本非常大。

你可以使用以下命令运行它：

nodejs a.out.js
或者使用 JSPI

nodejs --experimental-wasm-stack-switching a.out.js
然后你应该看到类似以下内容：

sleeping...
sleeping...
sleeping...
sleeping...
sleeping...
timer happened!
代码是用一个简单的循环编写的，它在运行时不会退出，通常情况下，这将不允许浏览器处理异步事件。有了 Asyncify/JSPI，这些休眠实际上会让出控制权给浏览器的主要事件循环，定时器就可以工作了！

--------------------------------------------

fetch.cpp

让异步 Web API 仿佛是同步的
除了 emscripten_sleep 和其他标准同步 API 之外，Asyncify 还支持添加你自己的函数。为此，你需要创建一个从 Wasm 调用的 JS 函数（因为 Emscripten 从 JS 运行时控制着 Wasm 的暂停和恢复）。

一种方法是使用 JS 库函数。另一种方法是使用 EM_ASYNC_JS，我们将在下一个示例中使用它

在这个示例中，异步操作是 fetch，这意味着我们需要等待 Promise。虽然该操作是异步的，但请注意，main() 中的 C 代码是完全同步的！

要运行此示例，首先用以下命令编译它：

emcc example.c -O3 -o a.html -s<ASYNCIFY or JSPI>
要运行它，你需要运行一个 本地 Web 服务器，然后浏览到 https://:8000/a.html。你将看到类似以下内容：

before
waiting for a fetch
got the fetch response
after
这表明 C 代码只在异步 JS 完成后才继续执行。