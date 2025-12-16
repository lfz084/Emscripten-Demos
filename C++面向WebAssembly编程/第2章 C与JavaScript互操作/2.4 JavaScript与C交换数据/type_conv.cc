#include "../../head.h"

//type_conv.cc
#include <stdio.h>

EM_PORT_API(void) print_int(int a) {
  printf("C{print_int() a:%d}\n", a);
}

EM_PORT_API(void) print_float(float a) {
  printf("C{print_float() a:%f}\n", a);
}

EM_PORT_API(void) print_double(double a) {
  printf("C{print_double() a:%lf}\n", a);
}

int main() {
  EM_ASM({
    Module._print_int(3.4);
    Module._print_int(4.6);
    Module._print_int(-3.4);
    Module._print_int(-4.6);
    Module._print_float(2000000.03125);
    Module._print_double(2000000.03125);
  });
  return 0;
}