#include <stdio.h>
#include "../../head.h"

//int64_exp.cc
EM_PORT_API(int64_t) i64_add(int64_t a, int64_t b) {
	int64_t c = a + b;
	printf("a:%lld, b:%lld:, a+b: %lld\n", a, b, c);
	return c;
}

EM_PORT_API(int64_t) i64_add_lh(uint32_t a_l, uint32_t a_h, uint32_t b_l, uint32_t b_h) {
	int64_t a = a_l | (int64_t)a_h << 32;
	int64_t b = b_l | (int64_t)b_h << 32;
	int64_t c = a + b;
	printf("a:%lld, b:%lld:, a+b: %lld\n", a, b, c);
	return c;
}

int main() {
	printf("main():\n");
	printf("%lld\n", i64_add(9223372036854775806, 1));
}