function Test() {
  console.log(Module._show_me_the_answer());
}
Module = {};
Module.onRuntimeInitialized = function() {
  setTimeout(Test, 2500);
}