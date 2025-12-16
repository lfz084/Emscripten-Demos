#include "../../head.h"

// sum.cc
EM_PORT_API(int) sum(int* ptr, int count) {
	int total = 0;
	for (int i = 0; i < count; i++){
		total += ptr[i];
	}
	return total;
}