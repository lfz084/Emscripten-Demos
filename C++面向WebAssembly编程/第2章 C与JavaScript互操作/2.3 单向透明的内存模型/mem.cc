#include "../../head.h"

//mem.cc
#include <stdio.h>

int g_int = 42;
double g_double = 3.1415926;

EM_PORT_API(int*) get_int_ptr() {
  return &g_int;
}

EM_PORT_API(double*) get_double_ptr() {
  return &g_double;
}

EM_PORT_API(void) print_data() {
  printf("C{g_int:%d}\n", g_int);
  printf("C{g_double:%lf}\n", g_double);
}