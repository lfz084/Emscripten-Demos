克隆和引用计数
在某些情况下，JavaScript 代码库的多个长期存在的部分需要在不同的时间段内保留对同一个 C++ 对象的引用。

为了适应这种情况，Emscripten 提供了一种 引用计数 机制，其中可以为同一个底层 C++ 对象生成多个句柄。只有当所有句柄都被删除时，该对象才会被销毁。

JavaScript clone() 方法返回一个新句柄。它最终也必须使用 delete() 进行处理

async function myLongRunningProcess(x, milliseconds) {
    // sleep for the specified number of milliseconds
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    x.method();
    x.delete();
}

const y = new Module.MyClass;          // refCount = 1
myLongRunningProcess(y.clone(), 5000); // refCount = 2
myLongRunningProcess(y.clone(), 3000); // refCount = 3
y.delete();                            // refCount = 2

// (after 3000ms) refCount = 1
// (after 5000ms) refCount = 0 -> object is deleted