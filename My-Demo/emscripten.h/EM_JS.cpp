#include <iostream>
#include <emscripten/emscripten.h>

// EM_JS(return_type, function_name, arguments, code)
// 用于 JavaScript 库函数的便捷语法。

// 这允许您在 C 代码中将 JavaScript 声明为函数，该函数可以像普通 C 函数一样调用。例如，以下 C 程序如果用 Emscripten 编译并在浏览器中运行，将显示两个警报

/*
EM_JS(void, two_alerts, (), {
  alert('hai');
  alert('bai');
});

int main() {
  two_alerts();
  return 0;
}
*/

// 参数可以像普通 C 参数一样传递，并且在 JavaScript 代码中具有相同的名称。这些参数可以是 int32_t 或 double 类型。

/*
EM_JS(void, take_args, (int x, float y), {
  console.log('I received: ' + [x, y]);
});

int main() {
  take_args(100, 35.5);
  return 0;
}
*/

// 以 null 结尾的 C 字符串也可以传递到 EM_JS 函数中，但要对它们进行操作，需要将它们从堆中复制出来以转换为高级 JavaScript 字符串。
// 编译命令要加上 -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$UTF8ToString'


EM_JS(void, say_hello, (const char* str), {
  console.log('hello ' + UTF8ToString(str));
});

int main() {
    const char* s = "emscript\0";
    say_hello(s);
}


// 以相同的方式，可以将指向任何类型（包括 void *）的指针传递到 EM_JS 代码中，它们在那里显示为整数，就像上面的 char * 指针一样。可以通过直接读取堆来管理对数据的访问。

/*
EM_JS(void, read_data, (int* data), {
  console.log('Data: ' + HEAP32[data>>2] + ', ' + HEAP32[(data+4)>>2]);
});

int main() {
  int arr[2] = { 30, 45 };
  read_data(arr);
  return 0;
}
*/

// 此外，EM_JS 函数可以将值返回给 C 代码。输出值使用 return 语句传回

/*
EM_JS(int, add_forty_two, (int n), {
  return n + 42;
});

EM_JS(int, get_memory_size, (), {
  return HEAP8.length;
});

int main() {
  int x = add_forty_two(100);
  int y = get_memory_size();
  std::cout << "add_forty_two: " << x << std::endl;
  std::cout << "get_memory_size: " << y << std::endl;
}
*/

// 字符串可以从 JavaScript 返回到 C，但需要小心内存管理。
// 编译命令要加上 -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$stringToNewUTF8'
/*
EM_JS(char*, get_unicode_str, (), {
  var jsString = 'Hello with some exotic Unicode characters: Tässä on yksi lumiukko: ☃, ole hyvä.';
  // 'jsString.length' would return the length of the string as UTF-16
  // units, but Emscripten C strings operate as UTF-8.
  return stringToNewUTF8(jsString);
});

int main() {
  char* str = get_unicode_str();
  printf("UTF8 string says: %s\n", str);
  // Each call to _malloc() must be paired with free(), or heap memory will leak!
  free(str);
  return 0;
}
*/