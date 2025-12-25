function add(...args) {
  let sum = 0;
  for (let i = 0; i < args.length; i++)
    sum += args[i];
  return sum
}

function delay(ms) {
  return new Promise(resolve => setTimeout(() => resolve("delay: " + ms + "ms"), ms));
}

function testError() {
  throw "testError";
}

function returnArray(arr) {
  return arr;
}

function testVerify() {
  return msg_exports["verifyPermission"]("worker verify")
}

function testProgress(...args) {
  const thisProgressFunc = getProgressFunction("testProgress");
  return new Promise(resolve => {
    let p = 0;
    const timer = setInterval(() => {
      p += 0.1;
      thisProgressFunc(parseInt(p * 100) / 100, parseInt(p * 100) + "%");
      if (p > 1) {
        clearInterval(timer);
        resolve(...args);
      }
    },
      200)
  })
}