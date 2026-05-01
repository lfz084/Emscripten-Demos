//  javaScript async file object

/**-------------- class JSFile ------------------------------
 * READ                   static const
 * WRITE                  static const
 * READWRITE              static const
 * STR_MODES              static const string Array 
 * requestPermission      static async function
 * isFile                 static function
 * isFileHandle           static function
 * createWritable         static asycn function
 * getReader              static async function
 * 
 * kind                   property readOnly
 * name                   property readOnly
 * hasHandle              function
 * open                   async function
 * close                  async function
 * flush                  async function
 * getSize                async function
 * truncate               async function
 * seek                   async function
 * read                   async function
 * write                  async function
--------------------------------------------------**/
 
{

const READ = 1;
const WRITE = 2;
const READWRITE = READ | WRITE;
const STR_MODES =  [, "read", "readwrite", "readwrite"];
Object.freeze(STR_MODES);

var JSFile = class JSFile {
  
  static get READ() { return READ }
  static get WRITE() { return WRITE }
  static get READWRITE() { return READWRITE }
  static get STR_MODES() { return STR_MODES }
  
  static async requestPermission(_fileHandle, _mode) {
    return verifyPermission(_fileHandle, STR_MODES[_mode]);
  }
  
  static isFile(_handle) {
    return _handle && _handle.constructor.name === "File";
  }

  static isFileHandle(_handle) {
    return _handle && _handle.constructor.name === "FileSystemFileHandle";
  }

  static async createWritable(_handle) {
    const writableStream = await _handle.createWritable();
    return writableStream;
  }

  static async getReader(_handle) {
    const file = await _handle.getFile();
    const readableStream = file.stream();
    const reader = readableStream.getReader({ mode: "byob" });
    return reader;
  }
  
  #mode;
  #offset;
  #handle;
  #reader;
  #writable;
  
  constructor() {
    
  }
  
  get kind() { return this.hasHandle() && this.#handle.kind }
  get name() { return this.hasHandle() && this.#handle.name }
  
  hasHandle() {
    return JSFile.isFileHandle(this.#handle);
  }
  
  async open(_handle, mode = 1) {
    if (JSFile.isFile(_handle)) {
      this.#mode = JSFile.READ;
      this.#offset = 0;
      this.#handle = undefined;
      this.#reader = _handle.stream().getReader({ mode: "byob" });
      this.#writable = undefined;
      return;
    }
    if (!JSFile.isFileHandle(_handle)) throw new Error("fileHandle error");
    if (!JSFile.STR_MODES[mode]) throw new Error("mode error");
    const permission = await JSFile.requestPermission(_handle, mode);
    if (!permission) throw new Error("requestPermission error");
    this.#mode = mode;
    this.#offset = 0;
    this.#handle = _handle;
    this.#reader = (mode & JSFile.READ) ? (await JSFile.getReader(this.#handle)) : undefined;
    this.#writable = (mode & JSFile.WRITE) ? (await JSFile.createWritable(this.#handle)) : undefined;
  }
  
  async close() {
    const writable = this.#writable;
    this.#mode = 0;
    this.#offset = 0;
    this.#handle = undefined;
    this.#reader = undefined;
    this.#writable = undefined;
    writable && (await writable.close());
  }
  
  async flush() {
    await this.#writable.close();
    this.#writable = await JSFile.createWritable(this.#handle);
    await this.#writable.seek(this.#offset);
  }
  
  async truncate(size) {
    await this.#writable.truncate(size);
    return undefined;
  }
  
  async seek(offset) {
    await this.#writable.seek(offset);
    this.#offset = offset;
    return undefined;
  }
  
  async getSize() {
    return this.#handle.getFile().then(file=>file.size)
  }
  
  async read(_buffer) {
    const bytes = await this.#reader
      .read(new Uint8Array(new ArrayBuffer(_buffer.byteLength)))
      .then(function ({ done, value }) {
        if (done) return 0;
        const len = value.byteLength;
        const target = new Uint8Array(_buffer.buffer || _buffer, _buffer.byteOffset, len);
        const source = new Uint8Array(value.buffer);
        for (let i = 0; i < len; i++) target[i] = source[i];
        return len
      });
    this.#offset += bytes;
    return bytes;
  }
  
  async write(_buffer) {
    await this.#writable.write(_buffer);
    const bytes = _buffer.byteLength
    this.#offset += bytes;
    return bytes;
  }
  
};

}