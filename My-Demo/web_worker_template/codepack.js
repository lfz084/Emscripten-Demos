// get atgv;
const argv = process.argv;
console.info(argv)

const jsonFileName = argv[2] || "./codepack.json";
const OUTPUT_WORKER_MSG_DATA = argv[3] || false;
const DEBUG = argv[4] || false;

console.log(">>> step 01");
console.log("runing script \"" + __filename.slice(__filename.lastIndexOf("\/") + 1 - __filename.length) + "\"");

const fs = require("fs");

var importFileNames = ["./imports.js"];
var exportFileNames = ["./exports.js"];
var workerName = "./worker.js";
var debugName = "./debug.js";
var htmlName = "./worker.html";
var htmlTitle = htmlName.split("/").pop();
var templateHtmlName = "template.html";

if (fs.existsSync(jsonFileName)) {
  try {
    var jsonfileData = fs.readFileSync(jsonFileName);
    var jsonString = jsonfileData.toString();
    var obj = JSON.parse(jsonString);
    importFileNames = obj.importFileNames || importFileNames;
    exportFileNames = obj.exportFileNames || exportFileNames;
    workerName = obj.workerName || workerName;
    debugName = obj.debugName || debugName;
    htmlName = obj.htmlName || htmlName;
    htmlTitle = obj.htmlTitle || htmlTitle;
    templateHtmlName = obj.templateHtmlName || templateHtmlName;
  }catch(e) {
    console.error(e)}
} else {
  console.warn(`file "${jsonFileName}" not found`);
}

console.log(">>> step 02");
var importWebCode = "";
var importWorkerCode = "";
for (filename of importFileNames) {
  console.log("read " + filename);
  if (fs.existsSync(filename)) {
    var importsData = fs.readFileSync(filename);
    var importsCode = importsData.toString();
    DEBUG && console.log(importsCode)
    var importFuncNames = filterAllFunctionNames(importsCode);
    DEBUG && console.log(importFuncNames)
    importWebCode += "\n" + importsCode + "\n" + createAssignCode("msg_exports", importFuncNames, createFunctionNameCodeLine);
    DEBUG && console.log(importWebCode);
    importWorkerCode += "\n" + createAssignCode("msg_exports", importFuncNames, createMessageFunctionCodeLine);
    DEBUG && console.log(importWorkerCode);
  } else {
    console.warn(`file "${filename}" not found`);
  }
}

console.log(">>> step 03");
var exportWebCode = "";
var exportWorkerCode = "";
for (filename of exportFileNames) {
  console.log("read " + filename);
  if (fs.existsSync(filename)) {
    var exportsData = fs.readFileSync(filename);
    var exportsCode = exportsData.toString();
    DEBUG && console.log(exportsCode)
    var exportFuncNames = filterAllFunctionNames(exportsCode);
    DEBUG && console.log(exportFuncNames);
    exportWebCode += "\n" + createAssignCode("msg_exports", exportFuncNames, createMessageFunctionCodeLine);
    DEBUG && console.log(exportWebCode);
    exportWorkerCode += "\n" + exportsCode + "\n" + createAssignCode("msg_exports", exportFuncNames, createFunctionNameCodeLine);
    DEBUG && console.log(exportWorkerCode);
  } else {
    console.warn(`file "${filename}" not found`);
  }
}

console.log(">>> step 04");
console.log("read " + __dirname + "/" + "template.js");
var templateData = fs.readFileSync(__dirname + "/" + "template.js");
var templateCode = templateData.toString();
DEBUG && console.log(templateCode);

console.log(">>> step 05");
console.log("create worker code");0
var workerCode = templateCode;
const regexp_OUTPUT_MSG_DATA = /\{\{\{\s*\n*\s*BOOL_OUTPUT_MSG_DATA\s*\n*\s*\}\}\}/;
const regexp_IMPORT_WEB_CODE = /\{\{\{\s*\n*\s*IMPORT_WEB_CODE\s*\n*\s*\}\}\}/;
const regexp_IMPORT_WORKER_CODE = /\{\{\{\s*\n*\s*IMPORT_WORKER_CODE\s*\n*\s*\}\}\}/;
const regexp_EXPORT_WEB_CODE = /\{\{\{\s*\n*\s*EXPORT_WEB_CODE\s*\n*\s*\}\}\}/;
const regexp_EXPORT_WORKER_CODE = /\{\{\{\s*\n*\s*EXPORT_WORKER_CODE\s*\n*\s*\}\}\}/;
workerCode = workerCode.replace(regexp_OUTPUT_MSG_DATA, OUTPUT_WORKER_MSG_DATA);
workerCode = workerCode.replace(regexp_IMPORT_WEB_CODE, formatCode(regexp_IMPORT_WEB_CODE, templateCode, importWebCode));
workerCode = workerCode.replace(regexp_IMPORT_WORKER_CODE, formatCode(regexp_IMPORT_WORKER_CODE, templateCode, importWorkerCode));
workerCode = workerCode.replace(regexp_EXPORT_WEB_CODE, formatCode(regexp_EXPORT_WEB_CODE, templateCode, exportWebCode));
workerCode = workerCode.replace(regexp_EXPORT_WORKER_CODE, formatCode(regexp_EXPORT_WORKER_CODE, templateCode, exportWorkerCode));

console.log(">>> step 06");
console.log("write " + workerName);
fs.writeFileSync(workerName, workerCode);

console.log(">>> step 07");
console.log("read " + debugName);
if (fs.existsSync(debugName)) {
  var debugData = fs.readFileSync(debugName);
  var debugCode = debugData.toString();
} else {
  console.warn(`file ${debugName} not found`);
  var debugCode;
}

if (debugCode) {
  console.log(">>> step 08");
  console.log("read" + __dirname + "/" + templateHtmlName);
  var htmlData = fs.readFileSync(__dirname + "/" + templateHtmlName);
  var htmlCode = htmlData.toString();

  console.log(">>> step 09");
  console.log("create html code");
  const regexp_HTML_TITLE = /\{\{\{\s*\n*\s*HTML_TITLE\s*\n*\s*\}\}\}/;
  const regexp_HTML_SCRIPT = /\{\{\{\s*\n*\s*HTML_SCRIPT\s*\n*\s*\}\}\}/;
  const regexp_HTML_WORKERNAME = /\{\{\{\s*\n*\s*WORKERNAME\s*\n*\s*\}\}\}/;
  htmlCode = htmlCode.replace(regexp_HTML_TITLE, htmlTitle);
  htmlCode = replaceCode(regexp_HTML_SCRIPT, htmlCode, debugCode);
  htmlCode = htmlCode.replace(regexp_HTML_WORKERNAME, workerName.split("/").pop());

  console.log(">>> step 10");
  console.log("write " + htmlName);
  fs.writeFileSync(htmlName, htmlCode);
}

console.log("<<< completed.");



function filterAllFunctionNames(codeStr) {
  return codeStr.match(/(?<=function\s+)\w*\s*(?=\()/g) || [];
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