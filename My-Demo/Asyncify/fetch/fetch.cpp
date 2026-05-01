// example.c
#include <emscripten.h>
#include <stdio.h>

EM_ASYNC_JS(int, do_fetch, (), {
  out("waiting for a fetch");
  const response = await fetch("a.html");
  out("got the fetch response");
  // (normally you would do something with the fetch here)
  return 42;
});

int main() {
  puts("before");
  do_fetch();
  puts("after");
}