#include <iostream>
#include <emscripten/emscripten.h>

EM_ASYNC_JS(void, awaitPromise, (uint32_t ms), {
	return new Promise(resolve => setTimeout(resolve, ms));
})

int main() {
	uint32_t ms = 100;
	std::cout << "sleep " << ms << "ms" << std::endl;
	emscripten_sleep(ms);
	std::cout << "continue" << std::endl;
	ms = 500;
	std::cout << "sleep " << ms << "ms" << std::endl;
	emscripten_sleep(ms);
	std::cout << "continue" << std::endl;
	ms = 1000;
	std::cout << "sleep " << ms << "ms" << std::endl;
	emscripten_sleep(ms);
	std::cout << "continue" << std::endl;
	ms = 2000;
	std::cout << "sleep " << ms << "ms" << std::endl;
	emscripten_sleep(ms);
	std::cout << "continue" << std::endl;
	ms = 5000;
	std::cout << "sleep " << ms << "ms" << std::endl;
	emscripten_sleep(ms);
	std::cout << "end" << std::endl;
	
	ms = 100;
	std::cout << "sleep " << ms << "ms" << std::endl;
	awaitPromise(ms);
	std::cout << "continue" << std::endl;
	ms = 500;
	std::cout << "sleep " << ms << "ms" << std::endl;
	awaitPromise(ms);
	std::cout << "continue" << std::endl;
	ms = 1000;
	std::cout << "sleep " << ms << "ms" << std::endl;
	awaitPromise(ms);
	std::cout << "continue" << std::endl;
	ms = 2000;
	std::cout << "sleep " << ms << "ms" << std::endl;
	awaitPromise(ms);
	std::cout << "continue" << std::endl;
	ms = 5000;
	std::cout << "sleep " << ms << "ms" << std::endl;
	awaitPromise(ms);
	std::cout << "end" << std::endl;
	return 0;
}