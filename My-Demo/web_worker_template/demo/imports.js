// 弹窗请求用户授权，注入到 worker 环境中
function verifyPermission(...args) {
  return confirm(...args);
}