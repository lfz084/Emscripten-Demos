// 从 C/C++ 调用 JavaScript
// 以下 API 的指南材料可以在 从 C/C++ 调用 JavaScript 中找到。

// 回调的函数指针类型
// 以下类型用于定义在本文件中的许多函数中使用的函数回调签名。

// em_callback_func
// 用于没有参数的回调的通用函数指针类型。
// 定义为
// typedef void (*em_callback_func)(void)

// em_arg_callback_func
// 用于具有单个 void* 参数的回调的通用函数指针类型。
// 此类型用于定义需要传递任意数据的函数回调。例如，emscripten_set_main_loop_arg() 设置用户定义的数据，并在完成时将其传递给此类型的回调。
// 定义为
// typedef void (*em_arg_callback_func)(void*)

// em_str_callback_func
// 用于回调的通用函数指针类型，带有 C 字符串 (const char *) 参数。
// 此类型用于需要传递 C 字符串的函数回调。例如，它在 emscripten_async_wget() 中用于传递已异步加载的文件的名称。
// 定义为
// typedef void (*em_str_callback_func)(const char *)