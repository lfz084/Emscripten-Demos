#include <iostream>
#include <emscripten/emscripten.h>

const uint32_t ONE_MB = 1 << 20;
char buffer[ONE_MB] = {0};
char* fileData = NULL;
uint32_t fileBytes = 0;

uint32_t min (uint32_t a, uint32_t b) {
    return a < b ? a : b;
}

void loadBuffer(char*  const ptr, uint32_t leng) {
    for (uint32_t i = 0; i < leng; i++) {
        *(ptr+i) = buffer[i];
    }
}

void putBuffer(const char* ptr, uint32_t leng) {
    for (uint32_t i = 0; i < leng; i++) {
        buffer[i] = *(ptr+i);
    }
}

extern "C" {
    // 从 js 同步文件句柄 读取数据
    extern uint32_t js_read(const char* ptr, uint32_t leng);
    // 把数据 写入 js 同步文件句柄
    extern void js_write(const char* ptr, uint32_t leng);
    // 设置 js 同步文件句柄 定位
    extern void js_seek(int offset, int whence = 0);
    // 调整 js 同步文件句柄 大小
    extern void js_truncate(uint32_t size);
    // 获取 js 同步文件句柄 大小
    extern uint32_t js_getSize();
    
    EMSCRIPTEN_KEEPALIVE void readFile() {
        fileBytes = js_getSize();
        if (fileData != NULL) delete fileData;
        if (fileBytes == 0) return;
        fileData = new char[fileBytes];
        std::cout << "wasm readFile &fileData = " << (uint32_t)fileData << std::endl;
            
        uint32_t offset = 0;
        while (offset < fileBytes) {
            const uint32_t byteLength = min(ONE_MB, fileBytes - offset);
            js_read(buffer, byteLength);
            loadBuffer(fileData + offset, byteLength);
            offset += byteLength;
            if (!(offset & 0x1FFFFFF)) std::cout << "wasm read Total bytes: " << offset << std::endl;
        }
        std::cout << "wasm read complete. Total bytes: " << offset << std::endl;
    }   
    
    EMSCRIPTEN_KEEPALIVE void writeFile() {
        js_truncate(fileBytes);
        js_seek(0);
        std::cout << "wasm writeFile &fileData = " << (uint32_t)fileData << std::endl;
        
        uint32_t offset = 0;
        while (offset < fileBytes) {
            const uint32_t byteLength = min(ONE_MB, fileBytes - offset);
            putBuffer(fileData + offset, byteLength);
            js_write(buffer, byteLength);
            offset += byteLength;
            if (!(offset & 0x1FFFFFF)) std::cout << "wasm write Total bytes: " << offset << std::endl;
        }
        std::cout << "wasm write complete. Total bytes: " << offset << std::endl;
    }
}