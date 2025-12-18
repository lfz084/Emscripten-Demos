// 浏览器中测试，NODE 会报错
#include <stdio.h>

//packfile.cc
int main() {
	fp = fopen("./hello.txt", "rt");
	if (fp) {
		while (!feof(fp)) {
			char c = fgetc(fp);
			if (c != EOF) {
			  putchar(c);
			}
		}
	  putchar('\n'); //确保输出最后一千文本
		fclose(fp);
	}
	return 0;
}