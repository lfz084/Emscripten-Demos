//  javaScript sync file object

/**_____________ LocalFile class -----------------
 * 
____________________________________--___________**/

{

// const READ = JSFile.READ;
// const WRITE = JSFile.WRITE;
// const READWRITE = JSFile.READWRITE;
const READWRITE_UNSAFE = 4 | JSFile.READWRITE;
const STR_MODES =  [, "read-only", "readwrite", "readwrite",,,, "readwrite-unsafe"];
Object.freeze(STR_MODES);
  
var LocalFile = class LocalFile extends JSFile {
  
  // static get READ() { return READ }
  // static get WRITE() { return WRITE }
  // static get READWRITE() { return READWRITE }
  static get READWRITE_UNSAFE() { return READWRITE_UNSAFE }
   static get STR_MODES() { return STR_MODES }
  
  static async createSyncAccessHandle(handle, options) {
    const accessHandle = await handle.createSyncAccessHandle(options);
    return accessHandle;
  }
  
  #mode;
  #offset;
  #handle;
  #syncAccessHandle;
  
  constructor() {
    super()
  }
  
  async open(_handle, mode = LocalFile.READ) {
    if (!LocalFile.isFileHandle(_handle)) throw new Error("fileHandle error");
    if (!LocalFile.STR_MODES[mode]) throw new Error("mode error");
    const options = { mode: LocalFile.STR_MODES[mode]};
    const accessHandle = await LocalFile.createSyncAccessHandle(_handle, options);
    this.#mode = mode;
    this.#offset = 0;
    this.#handle = _handle;
    this.#syncAccessHandle = accessHandle;
  }
  
  close() {
    this.#mode = undefined;
    this.#offset = 0;
    this.#handle = undefined;
    this.#syncAccessHandle && this.#syncAccessHandle.close();
    this.#syncAccessHandle = undefined;
  }
  
  flush() {
    this.#syncAccessHandle.flush();
  }
  
  getSize() {
    return this.#syncAccessHandle.getSize();
  }
  
  truncate(size) {
    this.#syncAccessHandle.truncate(size);
  }
  
  seek(offset) {
    this.#offset = offset;
  }
  
  read(buffer) {
    const bytes = this.#syncAccessHandle.read(buffer, {at: this.#offset});
    this.#offset += bytes;
    return bytes;
  }
  
  write(buffer) {
    const bytes = this.#syncAccessHandle.write(buffer, {at: this.#offset});
    this.#offset += bytes;
    return bytes;
  }

};

}