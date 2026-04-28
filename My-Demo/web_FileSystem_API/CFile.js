{
  var CFile = class CFile {
    #fileId;
    
    constructor(_fileId) {
      this.#fileId = _fileId;
    }
    
    open(path, mode) {
      return FileSystem.openFile(this.#fileId, path, mode);
    }
    
    close() {
      return FileSystem.closeFile(this.#fileId);
    }
    
    getSize() {
      return FileSystem.getFileSize(this.#fileId);
    }
    
    flush() {
      return FileSystem.flushFile(this.#fileId);
    }
    
    truncate(size) {
      return FileSystem.truncateFile(this.#fileId, size);
    }
    
    seek(offset) {
      return FileSystem.seekFile(this.#fileId, offset);
    }
    
    read(buffer) {
      return FileSystem.readFile(this.#fileId, buffer);
    }
    
    write(buffer) {
      return FileSystem.writeFile(this.#fileId, buffer);
    }
  }
}