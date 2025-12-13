绑定库
绑定代码作为静态构造函数运行，静态构造函数只有在包含目标文件时才运行，因此在为库文件生成绑定时，编译器必须明确指示包含目标文件。

例如，要为使用 Emscripten 编译的假设 library.a 生成绑定，请使用 --whole-archive 编译器标志调用 emcc

emcc -lembind -o library.js -Wl,--whole-archive library.a -Wl,--no-whole-archive
