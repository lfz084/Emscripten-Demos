类
将类公开到 JavaScript 需要更复杂的绑定语句。例如

class MyClass {
public:
  MyClass(int x, std::string y)
    : x(x)
    , y(y)
  {}

  void incrementX() {
    ++x;
  }

  int getX() const { return x; }
  void setX(int x_) { x = x_; }

  static std::string getStringFromInstance(const MyClass& instance) {
    return instance.y;
  }

private:
  int x;
  std::string y;
};

// Binding code
EMSCRIPTEN_BINDINGS(my_class_example) {
  class_<MyClass>("MyClass")
    .constructor<int, std::string>()
    .function("incrementX", &MyClass::incrementX)
    .property("x", &MyClass::getX, &MyClass::setX)
    .property("x_readonly", &MyClass::getX)
    .class_function("getStringFromInstance", &MyClass::getStringFromInstance)
    ;
}
绑定块在临时 class_ 对象上定义了一系列成员函数调用（这种样式与 Boost.Python 中使用的样式相同）。这些函数注册类、它的 constructor()、成员 function()、class_function()（静态）和 property().

注意
************************
编译代码要加参数 --bind
g++ --bind xxx.cpp -o xxx.html
************************

此绑定块绑定了该类及其所有方法。通常情况下，你应该只绑定真正需要的项，因为每个绑定都会增加代码大小。例如，很少会绑定私有方法或内部方法。

然后，可以在 JavaScript 中创建 MyClass 的实例并使用它，如下所示

var instance = new Module.MyClass(10, "hello");
instance.incrementX();
instance.x; // 11
instance.x = 20; // 20
Module.MyClass.getStringFromInstance(instance); // "hello"
instance.delete();
注意

Closure 编译器 无法识别通过 Embind 公开到 JavaScript 的符号的名称。为了防止 Closure 编译器在你的代码（例如通过使用 --pre-js 或 --post-js 编译器标志）中重命名这些符号，需要对代码进行相应的注释。如果没有这些注释，生成的 JavaScript 代码将不再与 Embind 代码中使用的符号名称匹配，从而导致运行时错误。

为了防止 Closure 编译器重命名上述示例代码中的符号，需要将其重写如下

var instance = new Module["MyClass"](10, "hello");
instance["incrementX"]();
instance["x"]; // 11
instance["x"] = 20; // 20
Module["MyClass"]["getStringFromInstance"](instance); // "hello"
instance.delete();
请注意，这仅适用于优化器可以看到的代码，例如上面提到的 --pre-js 或 --post-js 中的代码，或在 EM_ASM 或 EM_JS 上。对于其他不受 Closure 编译器优化的代码，则不需要进行这些更改。如果你在没有 --closure 1 的情况下进行构建以启用 Closure 编译器，也不需要进行这些更改。