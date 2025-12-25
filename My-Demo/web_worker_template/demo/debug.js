document.body.onload = async function() {
  console.log("add(1, 2, 3)")
  await worker_exports.add(1, 2, 3).then(console.log).catch(console.error)

  console.log("testVerify()")
  await worker_exports.testVerify().then(console.log).catch(console.error)

  const arr = [8,[8]];
  console.log("returnArray(" + JSON.stringify(arr) + ")");
  await worker_exports.returnArray(arr).then(a => console.log(JSON.stringify(a))).catch(console.error)

  console.log("testError(1, 2, 3, 4, 5)")
  await worker_exports.testError(1, 2, 3, 4, 5).then(console.log).catch(console.error)

  console.log("set testProgress.progressFunction")
  worker_exports.testProgress.progressFunction = (...args) => console.log(...args);
  console.log('testProgress("end", 2)');
  await worker_exports.testProgress("end", 2).then(console.log).catch(console.error);

  const ms = 1500;
  console.log("delay(" + ms + ")")
  await worker_exports.delay(ms).then(console.log).catch(console.error)
}