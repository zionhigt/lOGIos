module.exports =  function(code) {
    const tokens = [];
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
            throw new Error("Anbigue R found ! Need you specifie a register address ?")
        }
        tokens.push({
            type: "address",
            value: addr,
        })
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

    return tokens;
} 