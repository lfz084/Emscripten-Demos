#include <emscripten.h>

extern "C" {
  extern void my_js(void);
}

int main() {
  my_js();
  return 0;
}