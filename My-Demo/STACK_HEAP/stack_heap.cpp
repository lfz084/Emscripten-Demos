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
            
            std::cout << "stack_base: " << base << std::endl;
            std::cout << "stack_end: " << end << std::endl;
            std::cout << "stack_current: " << current << std::endl;
            std::cout << "stack_free: " << free << std::endl;
        }
    }


    EMSCRIPTEN_KEEPALIVE void check_heap(int count) {
        const int size = 128 << 20;
        char* str;
        for (int i = 0; i < count; i++) {
            str = new(std::nothrow) char[size]; //(char*)malloc(size);
            std::cout << "str:" << (uint32_t)str << std::endl;
            if (str == NULL) {
                std::cout << "emscripten_heap_out" << std::endl;
                break;
            }
            else {
                uint32_t* const buf = (uint32_t*)str;
                const int end = size >> 2;
                for (int j = 0; j < end; j++) buf[j] = 0xFFFFFFFF;
            }
        }
    }
}


/*
    em++ -sSTACK_SIZE=1mb -sINITIAL_MEMORY=32mb -sALLOW_MEMORY_GROWTH=1 -sMEMORY_GROWTH_GEOMETRIC_STEP=1 -sMAXIMUM_MEMORY=4gb stack_heap.cpp -o demo.js
*/