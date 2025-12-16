function f1(){
  var answer = 42;
    function f2() {
      return answer;
    }
  return f2;
}
var jsShowMeTheAnswer = f1();

Module.onRuntimeInitialized = function() {
  Module._func();
}