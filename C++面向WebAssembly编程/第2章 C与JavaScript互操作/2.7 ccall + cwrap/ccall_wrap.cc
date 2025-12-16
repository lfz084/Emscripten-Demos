#include "../../head.h"
#include <stdio.h>
#include <string.h>

//ccall_wrap.cc
EM_PORT_API(double) add(double a, int b) {
	return a + (double)b;
}

EM_PORT_API(void) print_string(const char* str) {
	printf("C:print_string(): %s\n", str);
}

EM_PORT_API(int) sum(uint8_t* ptr, int count) {
	int total = 0, temp;
	for (int i = 0; i < count; i++){
		memcpy(&temp, ptr + i * 4, 4);
		total += temp;
	}
	return total;
}

EM_PORT_API(const char*) get_string() {
	const static char str[] = "This is a test.";
	return str;
}