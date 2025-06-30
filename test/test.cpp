#include <emscripten/emscripten.h>

const unsigned long bufferSize = 1 << 10;
const char buffer[bufferSize] = {0};

extern "C" {
  extern void input(const char* ptr, unsigned long leng);
  extern void output(const char* ptr, unsigned long leng);
  extern void print();
  EMSCRIPTEN_KEEPALIVE void copyArray() {
      input(buffer, bufferSize);
      output(buffer, bufferSize);
      print();
  }
}