第1章 Emscripten快速入门
  本章将简要介绍Emscripten的安装，并通过经典的“你好，世界！”例程展示如何使用Emscripten将C/C++代码编译为WebAssembly模块。
  
  1.1 安装Emscripten
  1.2 你好，世界！
  1.3 胶水代码初探
  1.4 编译目标及编译流程
  
第2章 C与JavaScript互操作
  本章围绕C与JavaScript代码互操作展开，主要内容包括三个部分：1.JavaScript如何调用C函数；2.C如何调用JavaScript方法；3.JavaScript如何与C交换数据。
  
  2.1 JavaScript调用C函数
  2.2 JavaScript函数注入C
  2.3 单向透明的内存模型
  2.4 JavaScript与C交换数据
  2.5 EM_ASM系列宏
  2.6 emscripten_run_script系列函数
  2.7 ccall + cwrap
  2.8 补充说明
  
第3章 Emscripten运行时
  本章将简要介绍Emscripten环境下与运行时相关的部分知识，包括消息循环、文件系统、内存管理等内容。
  
  3.1 main函数与生命周期
  3.2 消息循环
  3.3 文件系统
  3.4 内存管理
  3.5 Module定制及其他
  3.6 小结
  
第4章 WebAssembly友好的一般性方法
  本章将讨论以WebAssembly作为编译目标时，编写C/C程序常遇到的部分一般性问题。这些问题的发现及解决来自于笔者在实际工作中的经验，自然无法覆盖到所有的情况，并且我们提出的解法既不是唯一解，也不一定是最优解。C/C技巧浩如烟海，优雅编程的道路没有尽头，与诸君共勉。
  
  4.1 消息循环分离
  4.2 内存对齐
  4.3 使用C接口导出C++对象
  4.4 C++对象生命周期控制
  4.5 使用C接口注入JavaScript对象
  4.6 小心int64
  4.7 忘掉文件系统
  
第5章 网络IO
  
  5.1 XMLHttpRequest
  5.2 WebSocket
  
第6章 多线程
  在如今这个多核处理器成为标配的时代，多线程技术得到了广泛的应用。本章将介绍笔者在Emscripten环境下使用多线程的一些粗浅经验。

  6.1 JavaScript中的并发模型
  6.2 在Worker中使用Emscripten
  
第7章 GUI及交互
  本章将讨论与GUI及交互相关的话题：canvas、鼠标事件、键盘事件，并以一个小游戏Life结束本章内容。

  7.1 Canvas
  7.2 鼠标事件
  7.3 键盘事件
