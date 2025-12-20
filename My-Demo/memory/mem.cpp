#include <emscripten.h>
#include <emscripten/stack.h>
#include <iostream>

int main()
{
  uint32_t bufBytes = EM_ASM_INT(return Module.wasmMemory.buffer.byteLength);
  std::cout << "TOTAL_MEMORY = " << (bufBytes >> 20) << "mb + " << ((bufBytes & 0xFFFFF) >> 10) << "kb + " << (bufBytes & 0x3FF) << "bytes" << std::endl;
  uint32_t stack_base = (uint32_t)emscripten_stack_get_base();
  std::cout << "TOTAL_STACK = " << (stack_base >> 20) << "mb + " << ((stack_base & 0xFFFFF) >> 10) << "kb + " << (stack_base & 0x3FF) << "bytes" << std::endl;
  std::cout << "stack_base = " << stack_base << std::endl;
  uint32_t stack_end = (uint32_t)emscripten_stack_get_end();
  std::cout << "stack_end = " << stack_end << std::endl;
  uint32_t stack_current = (uint32_t)emscripten_stack_get_current();
  std::cout << "stack_current = " << stack_current << std::endl;
  uint32_t stack_free = (uint32_t)emscripten_stack_get_free();
  std::cout << "stack_free = " << stack_free << std::endl;
  
  int i = 0;
  while(i++ < 100)
  {
    void* a = malloc(1024*1024);
    std::cout << i << ": " << a << std::endl;
    if (!a) break;
  }
  std::cout << "exit" << std::endl;
}