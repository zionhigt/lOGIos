module.exports = function(tokens) {
    const methodsWithHandledOutput = [
        "add",
        "or",
        "and",
        "xor",
        "add",
        "sub",
        "not",
        "nor",
        "nand",
        "nxor",
    ]
    const jmpMethods = [
        "jgz",
        "jez",
        "jlz",
        "jngz",
        "jnez",
        "jnlz",
    ]

    const keywords = [
        ...methodsWithHandledOutput,
        ...jmpMethods,
        "mov",
        "direct",
        "stop",
        "gt",
        "eq",
        "lt",
        "ngt",
        "neq",
        "nlt",
    ]

    const expressions = [];
    let cursor = 0;
    while (cursor < tokens.length) {
        expressions.push(expression());
    }
    return expressions;

    function expression() {
        return statementExpresssion();
    }

    function statementExpresssion() {
        let token = addressExpresssion();
        if (token?.type === "statement") {
            switch (token.value) {
                case "stop":
                    token = {
                        type: "binary",
                        operator: "stop",
                        left: 0x00,
                        right: 0x00,
                        dest: 0x00,
                    }
                    break;
                default:
                    if (jmpMethods.includes(token.value)) {
                        token = {
                            type: "binary",
                            operator: token.value,
                            left: addressExpresssion(),
                            right: 0x00,
                            dest: 0x00,
                        }
                        break;
                    }
                    token = {
                        type: "binary",
                        operator: token.value,
                        left: addressExpresssion(),
                        right: addressExpresssion(),
                        dest: 0x00
                    }
                    if (methodsWithHandledOutput.includes(token.operator)) {
                        token.dest = addressExpresssion();
                    }

            }
        }
        return token;
    }

    function addressExpresssion() {
        let token = literalExpression();
        if (token?.type === "address") {
            return {
                type: "address",
                value: token.value,
            }
        }
        return token;
    }

    function literalExpression() {
        let token = tokens[cursor ++];
        if (token?.type === "string") {
            if (keywords.includes(token.value)) {
                return {
                    type: "statement",
                    value: token.value,
                }
            } else {
                return {
                    type: "comment",
                    value: token.value,
                }
            }
        }
        if (token?.type === "number") {
            return {
                type: "literal",
                value: token.value,
            }
        }
        return token;
    }
}