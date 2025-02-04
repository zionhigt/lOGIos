const fs = require("fs");
const path = require("path");

const lexer = require("./lexer.js");
const parser = require("./parser.js");
const compiler = require("./compiler.js");

function read(p) {
    p = path.join(__dirname, p);
    console.log(p)
    if (fs.existsSync(p)) {
        return fs.readFileSync(p).toString();
    } 
}
function write(p, name, data) {
    p = path.join(__dirname, p);
    const headers = "v2.0 raw\n";
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, {
            recursive: true
        })
    } 
    return fs.writeFileSync(path.join(p, name), headers + data);
}

const progDir = './code'
const data = read(path.join(progDir, "run.svbin"));

const tokens = lexer(data);
const ast = parser(tokens);

const binary = compiler(ast);


const codeName = "logi.prog";
write(progDir, codeName, binary);
console.log(`Write ${Math.floor(binary.split(" ").length * 4)} bytes to ${path.join(progDir, codeName)}`);