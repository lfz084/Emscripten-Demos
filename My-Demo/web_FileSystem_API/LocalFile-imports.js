async function verifyPermission(fileHandle, mode) {
  const opt = {
    mode
  };
  if ((await fileHandle.queryPermission(opt)) === "granted") {
    return true;
  }
  if ((await fileHandle.requestPermission(opt)) === "granted") {
    return true;
  }
  return false;
}