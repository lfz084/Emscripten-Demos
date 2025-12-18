#include <stdio.h>

//int64.cc
int main() {
	int64_t a = 9223372036854775806; //0x7FFFFFFFFFFFFFFE
	a += 1;
	printf("%lld\n", a);
}