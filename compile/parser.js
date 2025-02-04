module.exports = function(tokens) {
    const keywords = [
        "mov",
        "add",
        "direct",
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

    const expressions = [];
    let cursor = 0;
    while (cursor < tokens.length) {
        expressions.push(expression());
    }
    return expressions;
    function expression() {
        return addExpresssion();
    }

    function addExpresssion() {
        let token = addressExpresssion();
        while (token?.type === "statement") {
            token = {
                type: "binary",
                operator: token.value,
                left: addressExpresssion(),
                right: addressExpresssion(),
                dest: token.value === "mov" ? null : addressExpresssion(),
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