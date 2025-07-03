#include <iostream>
#include <emscripten/emscripten.h>

const uint32_t bufferSize = 8 << 10;
const char buffer[bufferSize] = {0};

extern "C" {
  extern void input(const char* ptr, uint32_t leng);
  extern void output(const char* ptr, uint32_t leng);
  EMSCRIPTEN_KEEPALIVE void test_iodata() {
      input(buffer, bufferSize);
      std::cout << "wasm input data from javascript:" << std::endl;
      std::cout << buffer << std::endl;
      output(buffer, bufferSize);
  }
}