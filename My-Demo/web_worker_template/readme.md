Web Worker 代码模板
使用这个模板，你可以方便地打包你的 Web Worker 应用代码。生成 worker.js 文件 和 worker.html 文件。

使用方法
1.首先你要安装好 node 环境
2.在你的工作目录下创建三个 js 文件。
  imports.js    要从 web 环境注入到 worker 环境中的 function 写在这个文件
  exports.js    要从 worker 环境导出到 web 环境中的 function 写在这个文件
  debug.js      调试 worker.js 功能的代码写在这个文件

3.打开终端到你的工作目录，输入命令
  node codepack.js
  (注意codepack.js在你本地的路径不要输错了)

运行成功后，你的工作目录下会多出两个文件 worker.js 和 worker.html