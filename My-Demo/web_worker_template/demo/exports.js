// 求和，测试可变参数
function add(...args) {
  let sum = 0;
  for (let i = 0; i < args.length; i++)
    sum += args[i];
  return sum
}

// 延迟，测试 Promise 工作是否正常
function delay(ms) {
  return new Promise(resolve => setTimeout(() => resolve("delay: " + ms + "ms"), ms));
}

// 抛出 Error，测试 Promise 能否捕捉到错误
function testError() {
  throw "testError";
}

// 原路返回数组，测试...args参数代码是否正确
function returnArray(arr) {
  return arr;
}

// worker 向 web 申请权限，web 端可以弹窗让用户选择是否授权
function testVerify() {
  return msg_exports["verifyPermission"]("worker request grant?")
}

// 模拟一个耗时任务，过程中可以返回一些进度参数
function testProgress() {
  const thisProgressFunc = getProgressFunction("testProgress");
  return new Promise(resolve => {
    let p = 0;
    const timer = setInterval(() => {
      p += 0.1;
      thisProgressFunc(parseInt(p * 100) / 100, parseInt(p * 100) + "%");
      if (p > 1) {
        clearInterval(timer);
        resolve();
      }
    },
      200)
  })
}