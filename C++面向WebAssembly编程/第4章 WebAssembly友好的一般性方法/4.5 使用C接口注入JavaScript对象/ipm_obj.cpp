#include "../../head.h"
#include <stdio.h>
#include <vector>

//imp_obj.cpp
struct JS_BUTTON;
EM_PORT_API(struct JS_BUTTON*) ButtonCreate();
EM_PORT_API(void) ButtonAddRef(struct JS_BUTTON* btn);
EM_PORT_API(int) ButtonRelease(struct JS_BUTTON* btn);
EM_PORT_API(void) ButtonSetInnerHtml(struct JS_BUTTON* btn, const char* str);

//-----------------------------------

std::vector < struct JS_BUTTON*> g_buttons;

EM_PORT_API(void) PushButton() {
  printf("imp_obj.cpp: PushButton()\n");
  JS_BUTTON* btn = ButtonCreate();
  char name[256];
  sprintf(name, "TestButton:%d", (int)btn);
  ButtonSetInnerHtml(btn, name);
  g_buttons.push_back(btn);
}

EM_PORT_API(void) PopButton() {
  if (g_buttons.size() <= 0) return;
  JS_BUTTON* btn = g_buttons.back();
  printf("imp_obj.cpp: PopButton()\n");
  ButtonRelease(btn);
  g_buttons.pop_back();
}