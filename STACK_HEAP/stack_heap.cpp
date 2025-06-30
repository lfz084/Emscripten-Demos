#include <iostream>
#include <emscripten/emscripten.h>
#include <emscripten/stack.h>

extern "C" {
    EMSCRIPTEN_KEEPALIVE void check_stack(int deep) {
        if (deep-- > 0) {
            check_stack(deep);
        }
        else {
            const unsigned int base = emscripten_stack_get_base();
            const unsigned int end = emscripten_stack_get_end();
            const unsigned int current = emscripten_stack_get_current();
            const unsigned int free = emscripten_stack_get_free();
            
            std::cout << "base: " << base << ",\t" << "end: " << end << ",\t" << "current: " << current << ",\t" << "free: " << free << std::endl;
        }
    }


    EMSCRIPTEN_KEEPALIVE void check_heap(int count) {
    try{
        const int size = 128 << 20;
        char* str;
        for (int i = 0; i < count; i++) {
            str = new(std::nothrow) char[size]; //(char*)malloc(size);
            std::cout << "str:" << (un)str << std::endl;
            if (str == NULL) {
                std::cout << "ooooooooooooooo" << std::endl;
                break;
            }
        }
    }
    catch(const char* msg) {
        std::cout << "6666666666" << msg << std::endl;
    }
    }
}


/*
    em++ -sMEMORY64=2 -sSTACK_SIZE=128kb -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=32mb -sMAXIMUM_MEMORY=4gb stack_heap.cpp -o demo.js
*/