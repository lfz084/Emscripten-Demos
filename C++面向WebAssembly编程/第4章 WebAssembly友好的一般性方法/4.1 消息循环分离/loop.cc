//loop.cc
#include <emscripten.h>
#include <stdio.h>
#include <time.h>
#include "../../head.h"

EM_PORT_API(void) step() {
	static int count = 0;
	static long cb = clock();	

	long t = clock();
	if (t - cb >= CLOCKS_PER_SEC) {
		cb = t;
		printf("current clock:%ld, current fps:%d\n", t, count);
		count = 0;
	}
	count++;
}