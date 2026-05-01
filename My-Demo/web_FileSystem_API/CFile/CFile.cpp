#pragma once
#include <stdint.h>

EM_JS(uint32_t, addFile, (), {
  try{
    return Module["FileSystem"]["addFile"]();
  }catch(e) {
    Module["printError"](e);
    return -1;
  }
});

EM_JS(void, removeFile, (uint32_t fileId), {
  try {
    Module["FileSystem"]["removeFile"](fileId);
  }catch(e) {
    Module["printError"](e);
  }
});

EM_ASYNC_JS(bool, openFile, (uint32_t fileId, const char* path, uint32_t mode), {
  try {
    await Module["FileSystem"]["openFile"](fileId, UTF8ToString(path), mode);
    return true;
  }catch(e) {
    Module["printError"](e);
    return false;
  }
});

EM_ASYNC_JS(void, closeFile, (uint32_t fileId), {
  try {
    await Module["FileSystem"]["closeFile"](fileId);
  }catch(e) {
    Module["printError"](e);
  }
});

EM_ASYNC_JS(void, flushFile, (uint32_t fileId), {
  try {
    await Module["FileSystem"]["flushFile"](fileId);
  }catch(e) {
    Module["printError"](e);
  }
});

EM_ASYNC_JS(uint32_t, getFileSize, (uint32_t fileId), {
  try {
    return await Module["FileSystem"]["getFileSize"](fileId);
  }catch(e) {
    Module["printError"](e);
    return -1;
  }
});

EM_ASYNC_JS(void, truncateFile, (uint32_t fileId, uint32_t size), {
  try {
    await Module["FileSystem"]["truncateFile"](fileId, size);
  }catch(e) {
    Module["printError"](e);
  }
});

EM_ASYNC_JS(void, seekFile, (uint32_t fileId, uint32_t offset), {
  try {
    await Module["FileSystem"]["seekFile"](fileId, offset);
  }catch(e) {
    Module["printError"](e);
  }
});

EM_ASYNC_JS(int32_t, readFile, (uint32_t fileId, const char* buffer, uint32_t size), {
  try {
    const dv = new DataView(Module.wasmMemory.buffer, buffer, size);
    return await Module["FileSystem"]["readFile"](fileId, dv);
  }catch(e) {
    Module["printError"](e);
    return -1;
  }
});

EM_ASYNC_JS(int32_t, writeFile, (uint32_t fileId, const char* buffer, uint32_t size), {
  try {
    const dv = new DataView(Module.wasmMemory.buffer, buffer, size);
    return await Module["FileSystem"]["writeFile"](fileId, dv);
  }catch(e) {
    Module["printError"](e);
    return -1;
  }
});

class CFile {
  private:
    uint32_t id;
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
    
    void flush() {
      return flushFile(id);
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
    
    int32_t read(const char* buffer, uint32_t size) {
      return readFile(id, buffer, size);
    }
    
    int32_t write(const char* buffer, uint32_t size) {
      return writeFile(id, buffer, size);
    }
    
    uint32_t getId() {
      return id;
    }
};