module.exports = function (ast) {
    const headers = {
        "alu": 0x00, 
        "mov": 0x40,
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
    const methods = {
        "mov": 0x00,
        ...aluMethods
    }

    function compile(expr) {
        switch (expr.type) {
            case ("literal"):
                return expr.value;
            case "address":
                return parseRegAddress(expr.value);
            case "binary":
                return parseBinary(expr);
            default:
                return '';
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
            dest
        ]
        .map(item => item.padStart(2, "0"))
        .join("")
        return binary;

    }

    return ast
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