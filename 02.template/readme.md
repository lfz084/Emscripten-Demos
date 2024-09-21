First of all, save the following C code in a file called hello2.c, in a new directory:

CPP

> #include <stdio.h>

> int main() {

>     printf("Hello World\n");
>     return 0;

> }

Search for the file shell_minimal.html in your emsdk repo. Copy it into a subdirectory called html_template inside your previous new directory.
Now navigate into your new directory (again, in your Emscripten compiler environment terminal window), and run the following command:

BASH

> emcc -o hello2.html hello2.c -O3 --shell-file html_template/shell_minimal.html