该示例预期能够加载位于test/hello_world_file.txt中的文件

FILE *file = fopen("test/hello_world_file.txt", "rb");
我们从“上面”test的目录编译示例，以确保虚拟文件系统以相对于编译时目录的正确结构创建。

以下命令用于将数据文件预加载到Emscripten的虚拟文件系统中——在运行任何已编译的代码之前。这种方法很有用，因为浏览器只能异步加载来自网络的数据（除了在Web Workers中），而许多本机代码使用同步文件系统访问。预加载确保在已编译的代码有机会访问Emscripten文件系统之前，数据文件的异步下载已完成（并且文件可用）。

./emcc test/hello_world_file.cpp -o hello.html --preload-file test/hello_world_file.txt
运行上述命令，然后在网页浏览器中打开hello.html，查看hello_world_file.txt中的数据是否正在显示。