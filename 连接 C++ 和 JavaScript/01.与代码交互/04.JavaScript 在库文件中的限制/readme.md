JavaScript 在库文件中的限制
如果您不熟悉 JavaScript，例如，如果您是 C/C++ 程序员并且只是使用 emscripten，那么以下问题可能不会出现，但如果您是经验丰富的 JavaScript 程序员，您需要知道某些常见的 JavaScript 实践在 emscripten 库文件中无法以某些方式使用。

为了节省空间，默认情况下，emscripten 只包含从 C/C++ 引用的库属性。它通过对链接的 JavaScript 库中每个使用的属性调用 toString 来实现这一点。这意味着您无法直接使用闭包，例如，因为 toString 与之不兼容 - 就像使用字符串创建 Web Worker 时一样，您也不能传递闭包。（请注意，此限制仅适用于传递到 JS 库中的 addToLibrary 的对象的键的值，即，顶层键值对是特殊的。函数内部的内部代码当然可以包含任意 JS）。

为了避免 JS 库的这种限制，您可以在使用 --pre-js 或 --post-js 选项的另一个文件中放入代码，这些选项允许任意正常的 JS，并且它将与输出的其余部分一起包含和优化。对于大多数情况，这是推荐的方法。另一个选项是另一个 <script> 标签。

或者，如果您更喜欢使用 JS 库文件，您可以让一个函数替换自身并在初始化期间调用它。

addToLibrary({

  // Solution for bind or referencing other functions directly
  good_02__postset: '_good_02();',
  good_02: function() {
    _good_02 = document.querySelector.bind(document);
  },

  // Solution for closures
  good_03__postset: '_good_03();',
  good_03: function() {
    var callCount = 0;
    _good_03 = function() {
      console.log("times called: ", ++callCount);
    };
  },

  // Solution for curry/transform
  good_05__postset: '_good_05();',
  good_05: function() {
    _good_05 = curry(scrollTo, 0);
 },

});
一个 __postset 是编译器将直接输出到输出文件的字符串。对于上面的示例，将发出此代码。

 function _good_02() {
   _good_o2 = document.querySelector.bind(document);
 }

 function _good_03() {
   var callCount = 0;
   _good_03 = function() {
     console.log("times called: ", ++callCount);
   };
 }

 function _good_05() {
   _good_05 = curry(scrollTo, 0);
};

// Call each function once so it will replace itself
_good_02();
_good_03();
_good_05();
您也可以将大部分代码放入 xxx__postset 字符串中。下面的示例，每个方法都声明了对 $method_support 的依赖，否则都是虚拟函数。 $method_support 本身具有一个相应的 __postset 属性，其中包含所有代码，以将各种方法设置为我们真正想要的函数。

addToLibrary({
  $method_support: {},
  $method_support__postset: [
    '(function() {                                  ',
    '  var SomeLib = function() {                   ',
    '    this.callCount = 0;                        ',
    '  };                                           ',
    '                                               ',
    '  SomeLib.prototype.getCallCount = function() {',
    '    return this.callCount;                     ',
    '  };                                           ',
    '                                               ',
    '  SomeLib.prototype.process = function() {     ',
    '    ++this.callCount;                          ',
    '  };                                           ',
    '                                               ',
    '  SomeLib.prototype.reset = function() {       ',
    '    this.callCount = 0;                        ',
    '  };                                           ',
    '                                               ',
    '  var inst = new SomeLib();                    ',
    '  _method_01 = inst.getCallCount.bind(inst);   ',
    '  _method_02 = inst.process.bind(inst);        ',
    '  _method_03 = inst.reset.bind(inst);          ',
    '}());                                          ',
  ].join('\n'),
  method_01: function() {},
  method_01__deps: ['$method_support'],
  method_02: function() {},
  method_01__deps: ['$method_support'],
  method_03: function() {},
  method_01__deps: ['$method_support'],
 });
注意：如果您使用的是 node 4.1 或更新版本，您可以使用多行字符串。它们仅在编译时使用，而不是在运行时使用，因此输出仍然可以在基于 ES5 的环境中运行。

另一个选项是将大部分代码放在一个对象中，而不是一个函数中，

addToLibrary({
  $method_support__postset: 'method_support();',
  $method_support: function() {
    var SomeLib = function() {
      this.callCount = 0;
    };

    SomeLib.prototype.getCallCount = function() {
      return this.callCount;
    };

    SomeLib.prototype.process = function() {
      ++this.callCount;
    };

    SomeLib.prototype.reset = function() {
      this.callCount = 0;
    };

    var inst = new SomeLib();
    _method_01 = inst.getCallCount.bind(inst);
    _method_02 = inst.process.bind(inst);
    _method_03 = inst.reset.bind(inst);
  },
  method_01: function() {},
  method_01__deps: ['$method_support'],
  method_02: function() {},
  method_01__deps: ['$method_support'],
  method_03: function() {},
  method_01__deps: ['$method_support'],
 });
有关其他示例，请参阅 library_*.js 文件。

注意

JavaScript 库可以声明依赖关系 (__deps)，但是它们仅用于其他 JavaScript 库。请参阅 /src 中名称格式为 library_*.js 的示例

您可以使用 autoAddDeps(myLibrary, name) 为所有方法添加依赖项，其中 myLibrary 是包含所有方法的对象，而 name 是它们都依赖的项。当所有实现的方法都使用包含帮助器方法的 JavaScript 单例时，这很有用。请参阅 library_webgl.js 以获取示例。

传递给 addToLibrary 的键生成以 _ 为前缀的函数。换句话说， my_func: function() {}, 变成 function _my_func() {}，因为 emscripten 中的所有 C 方法都有一个 _ 前缀。以 $ 开头的键将剥离 $ 并且不会添加下划线。