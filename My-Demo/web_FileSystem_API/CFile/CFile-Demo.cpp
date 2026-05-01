#ifndef EM_PORT_API
#	if defined(__EMSCRIPTEN__)
#		include <emscripten.h>
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#		else
#			define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#		endif
#	else
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype
#		else
#			define EM_PORT_API(rettype) rettype
#		endif
#	endif
#endif

#include <emscripten/bind.h>
#include <iostream>
#include <string>
#include <stdint.h>
#include "./CFile.cpp"

const uint32_t PATH_BUFFER_SIZE = 256;
const uint32_t DATA_BUFFER_SIZE = 1024;
char path_buffer[PATH_BUFFER_SIZE] = {0};
char data_buffer[DATA_BUFFER_SIZE] = {0};
CFile cFile;

uint32_t get_str_buffer_size() {
  return PATH_BUFFER_SIZE;
}

uint32_t get_str_buffer() {
  return (uint32_t)path_buffer;
}

uint32_t get_data_buffer_size() {
  return DATA_BUFFER_SIZE;
}

uint32_t get_data_buffer() {
  return (uint32_t)data_buffer;
}

bool open(uint32_t path, uint32_t mode) {
  return cFile.open((const char*)path, mode);
}

void close() {
  return cFile.close();
}

void flush() {
  return cFile.flush();
}

uint32_t getSize() {
  return cFile.getSize();
}

void truncate(uint32_t size) {
  return cFile.truncate(size);
}

void seek(uint32_t offset) {
  return cFile.seek(offset);
}

int32_t read(uint32_t buffer, uint32_t size) {
  return cFile.read((const char*)buffer, size);
}

int32_t write(uint32_t buffer, uint32_t size) {
  return cFile.write((const char*)buffer, size);
}

int main() {
  std::cout << "CFile id: " << cFile.getId() << std::endl;
  return 0;
}

EMSCRIPTEN_BINDINGS(cFile_exports) {
  emscripten::function("get_str_buffer", &get_str_buffer);
  emscripten::function("get_str_buffer_size", &get_str_buffer_size);
  emscripten::function("get_data_buffer", &get_data_buffer);
  emscripten::function("get_data_buffer_size", &get_data_buffer_size);
  emscripten::function("open", &open);
  emscripten::function("close", &close);
  emscripten::function("flush", &flush);
  emscripten::function("getSize", &getSize);
  emscripten::function("truncate", &truncate);
  emscripten::function("seek", &seek);
  emscripten::function("read", &read);
  emscripten::function("write", &write);
}