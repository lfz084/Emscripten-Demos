内存管理
提供 delete() JavaScript 方法来手动指示不再需要 C++ 对象并可以删除它

var x = new Module.MyClass;
x.method();
x.delete();

var y = Module.myFunctionThatReturnsClassInstance();
y.method();
y.delete();
注意

从 JavaScript 侧构造的 C++ 对象以及从 C++ 方法返回的 C++ 对象必须显式删除，除非使用了 reference 返回值策略（见下文）。

提示

可以利用 try … finally JavaScript 结构来确保所有代码路径都能删除 C++ 对象句柄，无论是否提前返回或抛出错误。

function myFunction() {
    const x = new Module.MyClass;
    try {
        if (someCondition) {
            return; // !
        }
        someFunctionThatMightThrow(); // oops
        x.method();
    } finally {
        x.delete(); // will be called no matter what
    }
}
自动内存管理
JavaScript 直到 ECMAScript 2021 或 ECMA-262 版本 12 才开始支持 终结器。新的 API 称为 FinalizationRegistry，它仍然不能保证提供的终结回调会被调用。Embind 在可用时会将此用于清理，但仅用于智能指针，并且仅作为最后的手段。

警告

强烈建议 JavaScript 代码显式删除其收到的所有 C++ 对象句柄。
