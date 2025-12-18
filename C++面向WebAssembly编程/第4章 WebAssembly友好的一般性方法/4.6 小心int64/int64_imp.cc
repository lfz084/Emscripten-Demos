#include <stdio.h>
#include "../../head.h"

//int64_imp.cc
EM_PORT_API(int64_t) i64_func(int64_t a, int64_t b);
EM_PORT_API(int64_t) i64_func_lh(uint32_t a_l, uint32_t a_h, uint32_t b_l, uint32_t b_h);

int main() {
	printf("i64_func: %lld\n", i64_func(0x7FFFFFFFFFFFFFFF, 1));
	printf("i64_func_lh: %lld\n", i64_func_lh(0xFFFFFFFF, 0x7FFFFFFF, 1, 0));
}