To start with, save the following code as hello3.c in a new directory:

CPP

    #include <stdio.h>
    #include <emscripten/emscripten.h>
    int main() {
        printf("Hello World\n");
        return 0;
    }

    #ifdef __cplusplus
    #define EXTERN extern "C"
    #else
    #define EXTERN
    #endif

    EXTERN EMSCRIPTEN_KEEPALIVE void myFunction(int argc, char ** argv) {
        printf("MyFunction Called\n");
    }

By default, Emscripten-generated code always just calls the main() function, and other functions are eliminated as dead code. Putting EMSCRIPTEN_KEEPALIVE before a function name stops this from happening. You also need to import the emscripten.h library to use EMSCRIPTEN_KEEPALIVE.
Note: We are including the #ifdef blocks so that if you are trying to include this in C++ code, the example will still work. Due to C versus C++ name mangling rules, this would otherwise break, but here we are setting it so that it treats it as an external C function if you are using C++.

Now add html_template/shell_minimal.html with {{{ SCRIPT }}} as content into this new directory too, just for convenience (you'd obviously put this in a central place in your real dev environment).
Now let's run the compilation step again. From inside your latest directory (and while inside your Emscripten compiler environment terminal window), compile your C code with the following command. Note that we need to compile with NO_EXIT_RUNTIME: otherwise, when main() exits, the runtime would be shut down and it wouldn't be valid to call compiled code. This is necessary for proper C emulation: for example, to ensure that atexit() functions are called.

BASH

    emcc -o hello3.html hello3.c --shell-file html_template/shell_minimal.html -s NO_EXIT_RUNTIME=1 -s "EXPORTED_RUNTIME_METHODS=['ccall']"
If you load the example in your browser again, you'll see the same thing as before!
Now we need to run our new myFunction() function from JavaScript. First of all, open up your hello3.html file in a text editor.
Add a <button> element as shown below, just above the first opening `<script type='text/javascript'> tag.
HTML

    <button id="mybutton">Run myFunction</button>
Now add the following code at the end of the first <script>` element:

    document.getElementById("mybutton").addEventListener("click", () => {
      alert("check console");
      const result = Module.ccall(
        "myFunction", // name of C function
        null, // return type
        null, // argument types
        null, // arguments
      );
    });
This illustrates how ccall() is used to call the exported function.