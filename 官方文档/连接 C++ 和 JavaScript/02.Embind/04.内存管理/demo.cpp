#include <iostream>
#include <emscripten.h>
#include <emscripten/bind.h>

class MyClass {
public:
  MyClass(int x, std::string y)
    : x(x)
    , y(y)
  {
    std::cout << "MyClass constructor x = " << x << ", y = " << y << std::endl;
  }
  
  ~MyClass()
  {
    std::cout << "MyClass Destructor" << std::endl;
  }

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
    const instance = new Module.MyClass(10, "hello");
    try {
        console.log(Module.MyClass.getStringFromInstance(instance));
    } finally {
        instance.delete(); // will be called no matter what
    }
  });
  return 0;
}