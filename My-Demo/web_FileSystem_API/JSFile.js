//  javaScript async file object

/**-------------- JSFile class------------------------------
 * READ                   static const
 * WRITE                  static const
 * READWRITE              static const
 * STR_MODES              static const Array string
 * requestPermission      static async function
 * isFileHandle           static function
 * createWritable         static asycn function
 * getReader              static async function
 * 
 * kind                   property readOnly
 * name                   property readOnly
 * hasHandle              function
 * open                   async function
 * close                  function
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
    if (!JSFile.isFileHandle(_handle)) throw new Error("fileHandle error");
    if (!JSFile.STR_MODES[mode]) throw new Error("mode error");
    const permission = await JSFile.requestPermission(_handle, mode);
    if (!permission) throw new Error("requestPermission error");
    this.#mode = mode;
    this.#handle = _handle;
    if(mode & JSFile.READ) {
      this.#reader = await JSFile.getReader(this.#handle);
    }
    if(mode & JSFile.WRITE) {
      this.#writable = await JSFile.createWritable(this.#handle);
    }
  }
  
  close() {
    this.#mode = 0;
    this.#handle = undefined;
    this.#reader = undefined;
    this.#writable && this.#writable.close();
    this.#writable = undefined
  }
  
  async flush() {
    return this.#writable.flush()
  }
  
  async truncate(size) {
    return this.#writable.truncate(size)
  }
  
  async seek(offset) {
    return this.#writable.seek(offset)
  }
  
  async getSize() {
    return this.#handle.getFile().then(file=>file.size)
  }
  
  async read(_buffer) {
    return this.#reader
      .read(new Uint8Array(new ArrayBuffer(_buffer.byteLength)))
      .then(function ({ done, value }) {
        if (done) return 0;
        const target = new Uint8Array(_buffer.buffer || _buffer);
        const source = new Uint8Array(value.buffer);
        const len = value.byteLength;
        for (let i = 0; i < len; i++) target[i] = source[i];
        return len
      });
  }
  
  async write(_buffer) {
    await this.#writable.write(_buffer);
    return _buffer.byteLength;
  }
  
};

}