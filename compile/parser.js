module.exports = function(analyze) {
    const { meta, tokens } = analyze;
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
        "jmp",
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
    const labels = meta?.labels || [];
    const _labels = {};
    const expressions = [];
    let cursor = 0;
    let _countLineIgnore = 0;
    while (cursor < tokens.length) {
        expressions.push(expression(expressions.length));
    }
    return {
        meta: { labels: _labels },
        body: expressions,
    };

    function expression(n) {
        return labelExpression(n);
    }

    function labelExpression(n) {
        let token = statementExpresssion(n);
        if (token.type === "label") {
            token = {
                type: "label",
                target: n - _countLineIgnore ++,
                value: token.value,
            };
            _labels[token.value] = token;
        }
        return token;
    }

    function statementExpresssion(n) {
        let token = addressExpresssion(n);
        
        if (keywords.includes(token.value)) {
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
                            left: addressExpresssion(n),
                            right: 0x00,
                            dest: 0x00,
                        }
                        break;
                    }
                    token = {
                        type: "binary",
                        operator: token.value,
                        left: addressExpresssion(n),
                        right: addressExpresssion(n),
                        dest: 0x00
                    }
                    if (methodsWithHandledOutput.includes(token.operator)) {
                        token.dest = addressExpresssion(n);
                    }

            }
        }
        return token;
    }

    function addressExpresssion(n) {
        let token = literalExpression(n);
        if (token?.type === "address") {
            return {
                type: "address",
                value: token.value,
            }
        }
        return token;
    }

    function literalExpression(n) {
        let token = tokens[cursor ++];
        if (token?.type === "string") {
            if (keywords.includes(token.value)) return token;
            if (labels.includes(token?.value)) {
                return {
                    type: "address_label",
                    value: token.value,
                }
            }
            _countLineIgnore++;
            return {
                type: "comment",
                value: token.value,
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