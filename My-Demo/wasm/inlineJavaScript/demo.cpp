#include <emscripten.h>

EM_JS(void, em_js, (const char* str), {
    console.log("EM_JS: " + UTF8ToString(str));
});
  
EM_ASYNC_JS(void, em_async_js, (const char* str), {
  await new Promise(resolve => setTimeout(resolve, 1800));
  console.log("EM_ASYNC_JS: " + UTF8ToString(str));
});


int main()
{
  const char* str =  "hello, emscripten";
  em_js(str);
  em_async_js(str);
  EM_ASM({
    console.log("EM_ASM: " + UTF8ToString($0));
  }, str);
  return 0;
}