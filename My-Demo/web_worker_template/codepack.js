const DEBUG = false;

console.log(">>> step 01");
console.log("runing script \"" + __filename.slice(__filename.lastIndexOf("\/") + 1 - __filename.length) + "\"");

var fs = require("fs");

console.log(">>> step 02");
console.log("read ./imports.js");
if (fs.existsSync("./imports.js")) {
  var importsData = fs.readFileSync("./imports.js");
  var importsCode = importsData.toString();
  DEBUG && console.log(importsCode)
  var importFuncNames = filterAllFunctionNames(importsCode);
  DEBUG && console.log(importFuncNames)
  var importWebCode = importsCode + "\n" + createAssignCode("msg_exports", importFuncNames, createFunctionNameCodeLine);
  DEBUG && console.log(importWebCode);
  var importWorkerCode = createAssignCode("msg_exports", importFuncNames, createMessageFunctionCodeLine);
  DEBUG && console.log(importWorkerCode);
} else {
  console.warn(`file "./imports.js" not found`);
  var importWebCode = "";
  var importWorkerCode = "";
}

console.log(">>> step 03");
console.log("read ./exports.js");
if (fs.existsSync("./exports.js")) {
  var exportsData = fs.readFileSync("./exports.js");
  var exportsCode = exportsData.toString();
  DEBUG && console.log(exportsCode)
  var exportFuncNames = filterAllFunctionNames(exportsCode);
  DEBUG && console.log(exportFuncNames);
  var exportWebCode = createAssignCode("msg_exports", exportFuncNames, createMessageFunctionCodeLine);
  DEBUG && console.log(exportWebCode);
  var exportWorkerCode = exportsCode + "\n" + createAssignCode("msg_exports", exportFuncNames, createFunctionNameCodeLine);
  DEBUG && console.log(exportWorkerCode);
} else {
  console.warn(`file "./exports.js" not found`);
  var exportWebCode = "";
  var exportWorkerCode = "";
}

console.log(">>> step 04");
console.log("read " + __dirname + "/" + "template.js");
var templateData = fs.readFileSync(__dirname + "/" + "template.js");
var templateCode = templateData.toString();
DEBUG && console.log(templateCode);

console.log(">>> step 05");
console.log("create worker code");
var workerCode = templateCode;
const regexp_IMPORT_WEB_CODE = /\{\{\{\s*\n*\s*IMPORT_WEB_CODE\s*\n*\s*\}\}\}/;
const regexp_IMPORT_WORKER_CODE = /\{\{\{\s*\n*\s*IMPORT_WORKER_CODE\s*\n*\s*\}\}\}/;
const regexp_EXPORT_WEB_CODE = /\{\{\{\s*\n*\s*EXPORT_WEB_CODE\s*\n*\s*\}\}\}/;
const regexp_EXPORT_WORKER_CODE = /\{\{\{\s*\n*\s*EXPORT_WORKER_CODE\s*\n*\s*\}\}\}/;
workerCode = workerCode.replace(regexp_IMPORT_WEB_CODE, formatCode(regexp_IMPORT_WEB_CODE, templateCode, importWebCode));
workerCode = workerCode.replace(regexp_IMPORT_WORKER_CODE, formatCode(regexp_IMPORT_WORKER_CODE, templateCode, importWorkerCode));
workerCode = workerCode.replace(regexp_EXPORT_WEB_CODE, formatCode(regexp_EXPORT_WEB_CODE, templateCode, exportWebCode));
workerCode = workerCode.replace(regexp_EXPORT_WORKER_CODE, formatCode(regexp_EXPORT_WORKER_CODE, templateCode, exportWorkerCode));

console.log(">>> step 06");
console.log("write ./worker.js")
fs.writeFileSync("./worker.js", workerCode);

console.log(">>> step 07");
console.log("read ./debug.js");
if (fs.existsSync("./debug.js")) {
  var debugData = fs.readFileSync("./debug.js");
  var debugCode = debugData.toString();
} else {
  console.warn(`file "./debug.js" not found`);
  var debugCode;
}

if (debugCode) {
  console.log(">>> step 08");
  console.log("read" + __dirname + "/" + "template.html");
  var htmlData = fs.readFileSync(__dirname + "/" + "template.html");
  var htmlCode = htmlData.toString();

  console.log(">>> step 09");
  console.log("create html code");
  const regexp_HTML_SCRIPT = /\{\{\{\s*\n*\s*HTML_SCRIPT\s*\n*\s*\}\}\}/;
  htmlCode = replaceCode(regexp_HTML_SCRIPT, htmlCode, debugCode);

  console.log(">>> step 10");
  console.log("write ./worker.html");
  fs.writeFileSync("./worker.html", htmlCode);
}

console.log("<<< completed.");



function filterAllFunctionNames(codeStr) {
  return codeStr.match(/(?<=function\s+)\w*\s*(?=\()/g);
}

function createMessageFunctionCodeLine(funcname) {
  const codeline = `${funcname}: createMessageFunction("${funcname}"),\n`;
  return codeline
}

function createFunctionNameCodeLine(funcname) {
  const codeline = `${funcname},\n`;
  return codeline
}

function createAssignCode(objectName, funcnames, codelineFunction) {
  let code = `Object.assign(${objectName}, {\n`;
  funcnames.map(name => code += "\t" + codelineFunction(name));
  code += `})`;
  return code;
}

function formatCode(exp, targetCode, sourceCode) {
  const index = targetCode.match(exp)["index"];
  let spaces = "";
  DEBUG && console.log("index = " + index);
  for (let i = index - 1; i >= 0; i--) {
    if (targetCode[i] === "\n") break;
    spaces = targetCode[i] + spaces;
  }
  DEBUG && console.log("spaces = -" + spaces + "-")
  return sourceCode.replace(/\n/g, "\n" + spaces);
}

function replaceCode(exp, targetCode, sourceCode) {
  return targetCode.replace(exp, formatCode(exp, targetCode, sourceCode));
}