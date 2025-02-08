module.exports =  function(code) {
    const tokens = [];
    const labels = [];
    let cursor = 0;
    

    while (cursor < code.length) {
        let token = code[cursor ++];
        switch (token.toLowerCase()) {
            case "\0":
            case "\n":
            case "\r":
            case " ":
            case "\t":
                break;
            case "r":
                regName();
                break;
            case ":":
                label();
                break;
            default:
                if (isAlpha(token)) {
                    alpha();
                    break;
                }
                
                if (isNum(token)) {
                    number();
                    break;
                }

                throw new Error("Unexpected token : " + token)
        }

    }

    function alpha() {
        const start = cursor - 1;
        while (isAlnum(code[cursor])) {
            cursor ++;
        }
        tokens.push({
            type: "string",
            value: code.slice(start, cursor).toLowerCase(),
        })
    }

    function number() {
        const start = cursor - 1;
        while (isNum(code[cursor])) {
            cursor ++;
        }
        tokens.push({
            type: "number",
            value: Number.parseInt(code.slice(start, cursor).toLowerCase()),
        })
    }

    function regName() {
        const start = cursor - 1;
        while (isNum(code[cursor])) {
            cursor ++;
        }

        const addr = code.slice(start, cursor).toLowerCase();
        if (addr === "r") {
            throw new Error("Ambiguous R found ! Need you specifie a register address ?")
        }
        tokens.push({
            type: "address",
            value: addr,
        })
    }

    function label() {
        const start = cursor - 1;
        while (isAlnum(code[cursor])) {
            cursor ++;
        }

        const addr = code.slice(start + 1, cursor).toLowerCase();
        if (addr === ":") {
            throw new Error("Ambiguous label found ! Need you specifie a label name ?")
        }
        tokens.push({
            type: "label",
            value: addr,
        })
        labels.push(addr);
    }

    function isAlnum(c) {
        return isAlpha(c) || isNum(c);
    }

    function isNum(c) {
        return c >= "0" && c <= "9";
    }

    function isAlpha(c) {
        return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
    }

    return {
        tokens,
        meta: { labels },
    };
} 