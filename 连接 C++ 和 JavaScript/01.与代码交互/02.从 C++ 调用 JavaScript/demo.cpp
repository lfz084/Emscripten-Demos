#include <stdio.h>
#include <emscripten.h>

EM_JS(void, call_alert, (), {
  alert('EM_JS: hello world!');
  //  throw 'all done';
});

int main() {
  call_alert();
  
  EM_ASM(
    alert('EM_ASM: hello world!');
    //  throw 'all done';
  );
  
  EM_ASM({
    console.log('EM_ASM $0: I received: ' + $0);
  }, 100);
  
  int x = EM_ASM_INT({
    console.log('EM_ASM_INT: I received: ' + $0);
    return $0 + 1;
  }, 100);
  printf("%d\n", x);
  
  return 0;
}
