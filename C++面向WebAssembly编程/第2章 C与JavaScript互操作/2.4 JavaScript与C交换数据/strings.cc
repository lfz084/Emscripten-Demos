#include "../../head.h"
#include <stdio.h>

//strings.cc
EM_PORT_API(const char*) get_string() {
	static const char str[] = "Hello, wolrd! 你好，世界！";
	return str;
}

EM_PORT_API(void) print_string(char* str) {
	printf("%s\n", str);
}