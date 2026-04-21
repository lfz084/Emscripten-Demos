document.body.onload = function() {
  worker_exports.sum(1,2,3).then(console.log).catch(console.error);
  worker_exports.max(1,2,3).then(console.log).catch(console.error);
}