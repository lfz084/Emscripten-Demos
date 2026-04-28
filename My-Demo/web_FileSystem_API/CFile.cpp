#pragma once
#include <stdint.h>

EM_ASYNC_JS(uint32_t, addFile, (), {
  return await Module["FileSystem"]["addFile"]();
});

EM_ASYNC_JS(void, removeFile, (uint32_t fileId), {
  return await Module["FileSystem"]["removeFile"](fileId);
});

EM_ASYNC_JS(bool, openFile, (uint32_t fileId, const char* path, uint32_t mode), {
  return await Module["FileSystem"]["openFile"](fileId, UTF8ToString(path), mode);
});

EM_ASYNC_JS(void, closeFile, (uint32_t fileId), {
  await Module["FileSystem"]["closeFile"](fileId);
});

EM_ASYNC_JS(uint32_t, getFileSize, (uint32_t fileId), {
  return await Module["FileSystem"]["getFileSize"](fileId);
});

EM_ASYNC_JS(void, truncateFile, (uint32_t fileId, uint32_t size), {
  await Module["FileSystem"]["truncateFile"](fileId, size);
});

EM_ASYNC_JS(void, seekFile, (uint32_t fileId, uint32_t offset), {
  await Module["FileSystem"]["seekFile"](fileId, offset);
});

EM_ASYNC_JS(void, readFile, (uint32_t fileId, const char* buffer), {
  await Module["FileSystem"]["readFile"](fileId, buffer);
});

EM_ASYNC_JS(void, writeFile, (uint32_t fileId, const char* buffer), {
  await Module["FileSystem"]["writeFile"](fileId, buffer);
});

class CFile {
  private:
    int id;
  public:
    CFile() {
      id = addFile();
    }
    
    ~CFile() {
      removeFile(id);
    }
    
    bool open(const char* path, uint32_t mode) {
      return openFile(id, path, mode);
    }
    
    void close() {
      closeFile(id);
    }
    
    uint32_t getSize() {
      return getFileSize(id);
    }
    
    void truncate(uint32_t size) {
      return truncateFile(id, size);
    }
    
    void seek(uint32_t offset) {
      return seekFile(id, offset);
    }
    
    uint32_t read(const char* buffer) {
      return readFile(id, buffer);
    }
    
    uint32_t write(const char* buffer) {
      return writeFile(id, buffer);
    }
};