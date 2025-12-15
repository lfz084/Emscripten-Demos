First we need an example to compile. Take a copy of the following simple C example, and save it in a file called hello.c in a new directory on your local drive:

CPP

    #include <stdio.h>
    int main() {
        printf("Hello World\n");
        return 0;
    }

Now, using the terminal window you used to enter the Emscripten compiler environment, navigate to the same directory as your hello.c file, and run the following command:

BASH

    emcc hello.c -o hello.html