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

---------------------------------------------------------------------------

codepack.js 命令行参数
  node codepack.js [参数1] [参数2] [参数3]
  
参数1 指定 json 配置文件(默认 codepack.json)。
参数2 bool 值(默认 false)，设置是否输出 worker message 信息，方便调试 Demo。
参数3 bool 值(默认 false)，设置是否输出 详细信息， 方便调试 codepack.js。

---------------------------------------------------------------------------

codepack.json 文件说明
  codepack json 配置文件，可以自定义生成 worker.js 和 html 文件。

json 文件结构如下例
  所有文件名是默认文件名，你可以更改文件名

{
  "importFileNames":  ["./imports.js"],  // 注入代码的 js 文件数组
  "exportFileNames":  ["./exports.js"],  // 导出代码的 js 文件数组
  "workerName":       "./worker.js",     // 要生成的 worker 文件名
  "debugName":        "./debug.js",      // debug 代码文件名
  "htmlName":         "./worker.html"    // 要生成的 html 文件名
  "htmlTitle":        "worker.html"      // html 文件名 title
  "templateHtmlName": "template.html"    // html template
}