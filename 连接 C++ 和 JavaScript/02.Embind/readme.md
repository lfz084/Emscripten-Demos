Embind
Embind 用于将 C++ 函数和类绑定到 JavaScript，以便编译后的代码可以以“普通”JavaScript 的自然方式使用。Embind 还支持 从 C++ 调用 JavaScript 类.

Embind 支持绑定大多数 C++ 结构，包括 C++11 和 C++14 中引入的结构。它唯一的重大限制是目前不支持 具有复杂生命周期语义的原始指针.

本文介绍如何使用 EMSCRIPTEN_BINDINGS() 块为函数、类、值类型、指针（包括原始指针和智能指针）、枚举和常量创建绑定，以及如何为可以在 JavaScript 中重写的抽象类创建绑定。它还简要解释了如何管理传递给 JavaScript 的 C++ 对象句柄的内存。

提示

除了本文中的代码

在 测试套件 中还有许多关于如何使用 Embind 的其他示例。

使用 Embind 连接 Web 上的 C++ 和 JavaScript（来自 CppCon 2014 的幻灯片）包含更多示例和关于 Embind 设计理念和实现的信息。

注意

Embind 的灵感来自 Boost.Python，并使用非常类似的方法来定义绑定。