#include <stdio.h>
#include <emscripten.h>
#include <emscripten/bind.h>

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
  emscripten::class_<MyClass>("MyClass")
    .constructor<int, std::string>()
    .function("incrementX", &MyClass::incrementX)
    .property("x", &MyClass::getX, &MyClass::setX)
    .property("x_readonly", &MyClass::getX)
    .class_function("getStringFromInstance", &MyClass::getStringFromInstance)
    ;
}

int main()
{
  EM_ASM({
    var instance = new Module["MyClass"](10, "hello");
    console.log("instance = " + instance);
    
    instance["incrementX"]();
    instance["x"]; // 11
    console.log('instance["x"] = ' + instance["x"]);
    
    instance["x"] = 20; // 20
    console.log('instance["x"] = ' + instance["x"]);
    
    Module["MyClass"]["getStringFromInstance"](instance); // "hello"
    console.log('Module["MyClass"]["getStringFromInstance"](instance) = ' + Module["MyClass"]["getStringFromInstance"](instance));
    
    instance.delete();
  });
  return 0;
}