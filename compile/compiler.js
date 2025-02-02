module.exports = function (ast) {
    const headers = {
        "alu": 0x00, 
        "mov": 0x40,
    }

    const aluMethods = {
        "add": 0x04,
        "sub": 0x05,
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
        let left  = expr.left;

        if (op === "mov") {
            cmd |= compile(left);
            left = expr.right;
            expr.right = null;
        }
          
        header |= cmd;

        if (left.type === "address") {
            header |= 0x20  
        }
        left = compile(left).toString(16);
        
        let right = 0x0
        if (expr.right) {      
            if (expr.right.type === "address") {
            header |= 0x10  
            }
            right = compile(expr.right);
        }
        right = right.toString(16);

        header = header.toString(16);
        let dest = 0x0
        if (expr.dest) {
            dest = compile(expr.dest);
        }
        dest = dest.toString(16);
        let binary = [
            header,
            left,
            right,
            dest
        ]
        .map(item => item.toString(16))
        .map(item => item.padStart(2, "0"))
        .join("")
        return binary;

    }

    let buffer = "";

    for (let expr of ast) {
        buffer += compile(expr);
    }
    return buffer;
}