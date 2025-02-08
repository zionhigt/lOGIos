module.exports = function (ast) {
    const { meta, body } = ast;
    const labels = meta?.labels || {};
    const headers = {
        "alu": 0x00,
        "compare": 0x80,
        "jmp": 0xc0,
        "mov": 0x40,
        "stop": 0x88,
    }

    const aluMethods = {
        "direct": 0x00,
        "or": 0x01,
        "and": 0x02,
        "xor": 0x03,
        "add": 0x04,
        "sub": 0x05,
        "not": 0x08,
        "nor": 0x09,
        "nand": 0x0a,
        "nxor": 0x0b,
    }
    const compareMethods = {
        "gt": 0x00,
        "eq": 0x01,
        "lt": 0x02,
        "ngt": 0x04,
        "neq": 0x05,
        "nlt": 0x06,
        
    }
    const jmpMethods = {
        "jgz": 0x00,
        "jez": 0x01,
        "jlz": 0x02,
        "jngz": 0x04,
        "jnez": 0x05,
        "jnlz": 0x06,
        
    }
    const methods = {
        "mov": 0x00,
        "stop": 0x00,
        ...aluMethods,
        ...compareMethods,
        ...jmpMethods,
    }


    function compile(expr) {
        switch (expr.type) {
            case "address_label":
                return parseAddressLabel(expr);
            case "literal":
                return expr.value;
            case "address":
                return parseRegAddress(expr.value);
            case "binary":
                return parseBinary(expr);
            default:
                return '';
        }

    }

    function parseAddressLabel (expr) {
        if (labels.hasOwnProperty(expr.value)) {
            return labels[expr.value].target;
        } else {
            throw new Error("Unreconized label '"+ expr.value +"'");
        }
    }

    function parseRegAddress (value) {
        return Number.parseInt(value.slice(1, value.length)) - 1;
    }
    
    function parseBinary (expr) {
        const op = expr.operator;
        let kind = op;
        if (aluMethods.hasOwnProperty(op)) {
            kind = "alu";
        }
        if (compareMethods.hasOwnProperty(op)) {
            kind = "compare";
        }
        if (jmpMethods.hasOwnProperty(op)) {
            kind = "jmp";
        }
        
        let header = headers[kind];
        let cmd = methods[op];
          
        if (expr.left.type === "address") {
            header |= 0x20  
        }
        let left = compile(expr.left);

        if (expr.right.type === "address") {
            header |= 0x10  
        }
        right = compile(expr.right);

        header |= cmd;

        let dest = 0x0
        if (expr.dest) {
            dest = compile(expr.dest);
        }

        header = header.toString(16);
        left = left.toString(16);
        right = right.toString(16);
        dest = dest.toString(16);

        let binary = [
            header,
            left,
            right,
            dest,
        ]
        .map(item => item.padStart(2, "0"))
        .join("")
        return binary;

    }

    return ast.body
    .filter(item => item.type !== "comment")
    .map(function(expr) {
        const compiled = compile(expr);
        if (typeof compiled !== "string" && !Number.isNaN(compiled)) {
            return compiled.toString(16).padStart(8, "0")
        }
        return compiled;
    })
    .join(" ");
}