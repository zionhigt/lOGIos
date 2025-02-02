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

const data = read("./code/run.svbin");

const tokens = lexer(data);
const ast = parser(tokens);

const binary = compiler(ast);

let res = "" 
for (let i = 0; i < binary.length; i++) {
    if (i % 8 === 0) {
        res += " ";
    }
    res += binary[i];
}
res = res.trim();
console.log(res)