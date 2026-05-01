#ifndef EM_PORT_API
#	if defined(__EMSCRIPTEN__)
#		include <emscripten.h>
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#		else
#			define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#		endif
#	else
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype
#		else
#			define EM_PORT_API(rettype) rettype
#		endif
#	endif
#endif

#include <iostream>

EM_ASYNC_JS(void, delay, (int timeout), {
  await new Promise(r=>setTimeout(r, timeout));
});

EM_PORT_API(int) test(int timeout) {
  delay(timeout);
  return 666;
}

int main() {
  std::cout << "hello " << std::endl;
  delay(2000);
  std::cout << "wotld" << std::endl;
}