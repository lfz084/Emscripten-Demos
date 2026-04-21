document.body.onload = async function() {
      btn01.innerText = "open";
      btn02.innerText = "close";
      btn03.innerText = "read";
      btn04.innerText = "write";
      
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle("lcFile", {create: true});
      
      btn01.onclick = async () => {
        await msg_exports.open(fileHandle, 3).catch(e=>console.error(e.stack));
        console.log("open: " + fileHandle.name)
      }
    
      btn02.onclick = async () => {
        await msg_exports.flush();
        await msg_exports.close();
        console.log("close")
      }
    
      btn03.onclick = async () => {
        msg_exports.read.progressFunction = function(...args) {
          const buffer = args[0].buffer || args[0];
          const byteOffset = args[0].byteOffset || 0;
          const byteLength = args[0].byteLength;
          console.log(new Uint8Array(buffer, byteOffset, byteOffset + byteLength))
        }
        console.log("read:")
        const bytes = await msg_exports.read(new ArrayBuffer(10));
        console.log("bytes: " + bytes)
      }
      
      btn04.onclick = async () => {
        const u8 = new Uint8Array([1,2,3,4,5,6,7,8,9,0]);
        console.log("write")
        const bytes = await msg_exports.write(new DataView(u8.buffer, 0, 8));
        console.log("bytes: " + bytes)
      }
    }