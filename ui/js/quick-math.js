const QuickMath = new function() {

    function on(format, ...args) {
        console.log(format, args);
    }

    function off(format, ...args) {
        //noop
    }

    let log = off;

    // Object definitions
    function QElement(_part) {
        this.type = 0;
        this.part = _part;
    }

    function QNegated(_part) {
        this.type = 1;
        this.part = _part;
    }

    function QAddition() {
        this.type = 2;
        this.signs = [];    //signs[i] represents the sign in front of parts[i], signs[0] is unused
        this.parts = [];    //true = positive, false = negative
        this.add = function(qe, sign) {
            if (sign === undefined) {
                sign = true;
            }
            this.signs.push(sign);
            this.parts.push(qe);
        };
        this.insert = function(qe, sign) {
            if (sign === undefined) {
                sign = true;
            }
            this.signs.push(sign);
            this.parts.push(qe);
        };
    }

    function QProduct(_parts, _explicit) {
        if (_explicit === undefined || _explicit === null) {
            _explicit = true;
        }
        this.type = 3;
        this.parts = _parts || [];
        this.times = function(qe) {
            this.parts.push(qe);
        };
        this.insert = function(qe) {
            this.parts.push(qe);
        };
        this.explicit = _explicit;  //explicit product will show a multiplication sign
    }

    function QQuotient(_num, _den) {
        this.type = 4;
        this.numerator = _num;
        this.denominator = _den;
    }

    function QExponent(_base, _pow) {
        this.type = 5;
        this.base = _base;
        this.power = _pow;
    }

    function QFunction(_name, _part) {
        this.type = 6;
        this.name = _name;
        this.part = _part;
        this.funcLog = _name === "log";
    }

    function QAbsolute(_part) {
        this.type = 7;
        this.part = _part;
    }

    function QIdentity(_part) {
        this.type = 8;
        this.part = _part;
        this.isLog = false;
        if (_part.type === 4) {
            let num = _part.numerator;
            let den = _part.denominator;
            if ((num.isLog || num.funcLog) && (den.isLog || den.funcLog))
                this.isLog = true;
        }
    }

    function QEquality(_parts) {
        this.type = 9;
        this.parts = _parts;
    }

    /**
     * Constants used
     */
    const OP = {
        ADD: "+",
        SUB: "-",
        E_PROD: "*",
        DIV: "/",
        EXP: "^",
        I_PROD: "@"
    };
    const TOKEN = {
        LEFT_PAREN: "(",
        RIGHT_PAREN: ")",
        LEFT_SQUARE: "[",
        RIGHT_SQUARE: "]"
    };

    const OPERATORS = Object.values(OP);
    const OP_EQUALITY = "=";
    const CONST_ARRAY = ["theta", "pi"];
    const CONST_DELIM = "#";

    const FUNCTIONS =
        (function() {
            const trig = ["sin", "cos", "tan", "sec", "csc", "cot"];
            let i_trig = trig.flatMap((t) => {return ["a" + t, "arc" + t]});
            return {
                NUMERIC:    new Set(["log", "sqrt", "abs", "int", "sgn", "ln"]),
                TRIG:       new Set(trig),
                I_TRIG:     new Set(i_trig),
                H_TRIG:     new Set(trig.map((t) => (t + "h"))),
                IH_TRIG:    new Set(i_trig.map((t) => (t + "h"))),
                IDENTITY:   "id",
            }
        }());

    function buildFunctions() {
        let array = [];
        array.push(...FUNCTIONS.IH_TRIG);
        array.push(...FUNCTIONS.I_TRIG);
        array.push(...FUNCTIONS.H_TRIG);
        array.push(...FUNCTIONS.TRIG);
        array.push(...FUNCTIONS.NUMERIC);
        return array;
    }

    const FUNC_ARRAY = buildFunctions();

    const UNARY_DELIM = "$";
    const UNARY_MINUS = UNARY_DELIM + OP.SUB + UNARY_DELIM;
    const UNARY_PLUS = UNARY_DELIM + OP.ADD + UNARY_DELIM;

    /**
     * Formats a quick element into a simple math string
     * @param qe            element to format
     * @param parenLevel    level of paren wrapping required by the parent element
     *              DEFAULT 0 - not required,               eg. 5 always
     *                      1 - necessary for order of ops  eg. -5, but -(1+2)
     *                      2 - required                    eg. sin(5) always
     */
    function format(qe, parenLevel) {
        if (qe === null || qe === undefined) {
            return "";
        }
        if (parenLevel === undefined || parenLevel === null) {
            parenLevel = 0;
        }
        if (parenLevel === 3 && qe.type !== 1) {
            parenLevel = 1;
        }
        let ret;
        switch (qe.type) {
            case 0:
                if (qe.part.charAt(0) === CONST_DELIM) {
                    ret = qe.part.slice(1, -1);
                } else {
                    ret = qe.part;
                }
                if (parenLevel === 1) {
                    parenLevel = 0; //skip parens
                }
                break;
            case 1:
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                ret = OP.SUB + format(qe.part, 1);
                break;
            case 2:
                let temp = [];
                temp.push(format(qe.parts[0]));
                for (let i = 1; i < qe.parts.length; i++) {
                    temp.push(qe.signs[i] ? OP.ADD : OP.SUB);
                    temp.push(format(qe.parts[i]));
                }
                ret = temp.join("");
                break;
            case 3:
                ret = qe.parts.map(function(x, idx, arr) {
                    if (!qe.explicit && idx > 0) {
                        if (x.type === 0 && arr[idx-1].type === 0) {
                            if (!isNaN(parseFloat(x.part)) && !isNaN(parseFloat(arr[idx - 1].part))) {
                                return format(x, 2);
                            }
                        } else if (x.type === 1) {
                            return format(x, 2);
                        }
                    }
                    return format(x, 1);
                }).join(qe.explicit ? OP.E_PROD : "");
                break;
            case 4:
                ret = format(qe.numerator, 1) + OP.DIV + format(qe.denominator, 1);
                break;
            case 5:
                ret = format(qe.base, 1) + OP.EXP + format(qe.power, 3);
                break;
            case 6:
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                ret = qe.name + format(qe.part, 2);
                break;
            case 7:
                ret = "abs" + format(qe.part, 2);
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                break;
            case 8:
                ret = "[" + format(qe.part) + "]";
                parenLevel = 0;
                break;
            case 9:
                return qe.parts.map(x => format(x)).join(OP_EQUALITY);
            default:
                throw new Error("Unknown element type: " + qe);
        }
        return parenLevel > 0 ? TOKEN.LEFT_PAREN + ret + TOKEN.RIGHT_PAREN : ret;
    }

    /**
     * Formats a quick element into a latex string
     * @param qe            element to format
     * @param parenLevel    level of paren wrapping required by the parent element
     *              DEFAULT 0 - not required,               eg. 5 always
     *                      1 - necessary for order of ops  eg. -5, but -(1+2)
     *                                                          1+2, but (1+2) / 3
     *                      2 - required                    eg. \sin(5) always
     *                      3 - required for inner exponent eg. 5^(5^2), but not (5^(5^2))
     */
    function formatLatex(qe, parenLevel) {
        if (qe === null || qe === undefined) {
            return "";
        }
        if (parenLevel === undefined || parenLevel === null) {
            parenLevel = 0;
        }
        function bracketWrap(string) {
            return "{" + string + "}";
        }
        if (qe.type !== 5 && parenLevel === 3)
            parenLevel = 1;

        //Special operators that MathQuill requires the use of the \operatorname tag
        const opSet = new Set(["asin", "acos", "atan", "asinh", "acosh", "atanh", "acsch", "asech", "atanh", "sgn", "int"]);

        let ret;
        switch (qe.type) {
            case 0:
                ret = qe.part;
                for (let i = 0; i < CONST_ARRAY.length; i++) {
                    ret = replaceAll(ret, CONST_DELIM + CONST_ARRAY[i] + CONST_DELIM, "\\" + CONST_ARRAY[i]);
                }
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                break;
            case 1:
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                ret = OP.SUB + formatLatex(qe.part, 1);
                break;
            case 2:
                let temp = [];
                temp.push(formatLatex(qe.parts[0]));
                for (let i = 1; i < qe.parts.length; i++) {
                    temp.push(qe.signs[i] ? OP.ADD : OP.SUB);
                    temp.push(formatLatex(qe.parts[i]));
                }
                ret = temp.join("");
                break;
            case 3:
                if (parenLevel === 1)
                    parenLevel = 0;
                ret = qe.parts.map(function (x, idx, arr) {
                    if (!qe.explicit && idx > 0) {
                        if (x.type === 1) {
                            return formatLatex(x, 2);
                        } else if (x.type === 0 && arr[idx-1].type === 0) {
                            if (!isNaN(parseFloat(x.part)) && !isNaN(parseFloat(arr[idx - 1].part))) {
                                return formatLatex(x, 2);
                            }
                        }
                    }
                    return formatLatex(x, 1);
                }).join(qe.explicit ? "\\cdot " : "");
                break;
            case 4:
                if (parenLevel === 1)
                    parenLevel = 0;
                ret = "\\frac" + bracketWrap(formatLatex(qe.numerator)) + bracketWrap(formatLatex(qe.denominator));
                break;
            case 5:
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                ret = formatLatex(qe.base, 3) + OP.EXP + bracketWrap(formatLatex(qe.power, 3));
                break;
            case 6:
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                if (qe.name === "sqrt") {
                    ret = "\\sqrt" + bracketWrap(formatLatex(qe.part));
                } else if (opSet.has(qe.name)) {
                    ret = "\\operatorname{" + qe.name + "}" + formatLatex(qe.part, 2);
                } else {
                    ret = "\\" + qe.name + formatLatex(qe.part, 2);
                }
                break;
            case 7:
                parenLevel = 0; //abs work as parens
                ret = "\\left|" + formatLatex(qe.part) + "\\right|";
                break;
            case 8:
                if (qe.isLog === true) {
                    let part = qe.part;
                    ret = "\\log_{" +
                        formatLatex(part.denominator.isLog ? part.denominator : part.denominator.part) +
                        "}" +       //if log is nested, format that log as well
                        formatLatex(part.numerator.isLog ? part.numerator : part.numerator.part, 2);
                    if (parenLevel === 1) {
                        parenLevel = 0;
                    }
                } else {
                    return formatLatex(qe.part, parenLevel);
                }
                break;
            case 9:
                return qe.parts.map(x => formatLatex(x)).join(OP_EQUALITY);
            default:
                console.error("Unknown element type: %o", qe);
                throw new Error("");
        }
        return parenLevel > 0 ? "\\left(" + ret + "\\right)" : ret;
    }

    function parse(string) {
        let parts = string.split(OP_EQUALITY);
        parts = parts.map(x => parseSub(x));
        if (parts.length === 1) {
            return parts[0];
        }
        return new QEquality(parts);
    }

    function parseSub(string) {

        if (string === undefined || string === null || string.length === 0) {
            return null;
        }

        string = replaceAll(string, " ", "");   //remove spaces

        function escape(string) {
            // Create a copy of the string
            let result = string.substring();

            // Wrap constants
            for (let i = 0; i < CONST_ARRAY.length; i++) {
                let constant = CONST_ARRAY[i];
                let filler = CONST_DELIM + i + CONST_DELIM;
                result = replaceAll(result, constant, filler);
            }
            //Wrap functions
            for (let i = 0; i < FUNC_ARRAY.length; i++) {
                let constant = FUNC_ARRAY[i];
                let filler = UNARY_DELIM + i + UNARY_DELIM;
                result = replaceAll(result, constant, filler);
            }
            // Unwrap functions
            for (let i = 0; i < FUNC_ARRAY.length; i++) {
                let filler = UNARY_DELIM + i + UNARY_DELIM;
                let literal = UNARY_DELIM + FUNC_ARRAY[i] + UNARY_DELIM;
                result = replaceAll(result, filler, literal);
            }
            // Unwrap constants
            for (let i = 0; i < CONST_ARRAY.length; i++) {
                let filler = CONST_DELIM + i + CONST_DELIM;
                let literal = CONST_DELIM + CONST_ARRAY[i] + CONST_DELIM;
                result = replaceAll(result, filler, literal);
            }


            //Get unary (-) and (+) operators
            if (result.charAt(0) === OP.SUB) {
                result = UNARY_MINUS + result.substring(1);
            } else if (result.charAt(0) === OP.ADD) {
                result = UNARY_PLUS + result.substring(1);
            }

            result = replaceAll(result, TOKEN.LEFT_PAREN + OP.SUB, TOKEN.LEFT_PAREN + UNARY_MINUS);
            result = replaceAll(result, TOKEN.LEFT_PAREN + OP.ADD, TOKEN.LEFT_PAREN + UNARY_PLUS);
            for (let op of OPERATORS) {
                result = replaceAll(result, op + OP.SUB, op + UNARY_MINUS);
                result = replaceAll(result, op + OP.ADD, op + UNARY_PLUS);
            }
            return result;
        }

        function implicitProduct(string) {

            function scoreLeft(c) {
                if (c === TOKEN.RIGHT_PAREN || c === TOKEN.RIGHT_SQUARE)
                    return 1;
                if (c === UNARY_DELIM) {
                    return -1;
                }
                return score(c);
            }
            function scoreRight(c) {
                if (c === TOKEN.LEFT_PAREN || c === TOKEN.LEFT_SQUARE)
                    return 1;
                if (c === UNARY_DELIM) {
                    return 1;
                }
                return score(c);
            }
            function score(c) {
                if (c === CONST_DELIM)
                    return 1;
                if (isLetter(c))
                    return 1;
                if (isOperator(c))
                    return -1;
                if (c === TOKEN.RIGHT_PAREN || c === TOKEN.LEFT_PAREN || c === TOKEN.RIGHT_SQUARE || c === TOKEN.LEFT_SQUARE)
                    return -1;
                return 0;
            }

            function isLetter(c) {
                // noinspection EqualityComparisonWithCoercionJS
                return c.toUpperCase() != c.toLowerCase();
            }

            function isOperator(c) {
                return OPERATORS.indexOf(c) !== -1;
            }

            function ignoreTrigger(c) {
                return c === UNARY_DELIM || c === CONST_DELIM;
            }

            for (let i = string.length - 1; i > 0; i--) {
                let right, left;
                do {
                    right = string.charAt(i);
                    left = string.charAt(i-1);
                } while (false);

                if (ignoreTrigger(right)) {
                    i--;
                    while (!ignoreTrigger(string.charAt(i))) {
                        //skip chars until ignore is over
                        i--;
                        if (i === 0) {
                            return string;
                        }
                        if (i < 0)
                            throw "something broke";
                    }
                    right = string.charAt(i);
                    left = string.charAt(i - 1);
                }
                if (scoreLeft(left) + scoreRight(right) > 0) {
                    string = stringInsert(string, i, OP.I_PROD);
                }
            }
            return string;

        }

        function tokenize(string) {

            function charType(char) {
                const SINGLES = new Set(OPERATORS);
                SINGLES.add(TOKEN.LEFT_PAREN);
                SINGLES.add(TOKEN.RIGHT_PAREN);
                const ESCAPES = new Set([UNARY_DELIM]);
                if (SINGLES.has(char)) {
                    return 1;
                }
                if (ESCAPES.has(char)) {
                    return -1;
                }
                return 0;
            }

            let builder = new ArrayBuilder();
            let escaped = false;
            for (let i = 0; i < string.length; i++) {
                let char = string.charAt(i);
                let type = charType(char);
                if (!escaped || type === -1) {
                    switch (type) {
                        case 0:
                            builder.add(char);
                            break;
                        case 1:
                            builder.append(char);
                            break;
                        case -1:
                            if (escaped) {
                                builder.add(char);
                                builder.next();
                            } else {
                                builder.next();
                                builder.add(char);
                            }
                            escaped = !escaped;
                            break;
                        default:
                            throw new Error("Unrecognized character: %s", char);
                    }
                } else {
                    builder.add(char);
                }
            }
            return builder.finish();
        }

        const TYPE = {
            LEFT_PAREN: -1,
            RIGHT_PAREN: -2,
            OPERAND: -3,
            LEFT_SQUARE: -4,
            RIGHT_SQUARE: -5
        };

        /**
         * The associativity of an operator
         * @param op
         * @return {number}     -1 for left, 1 for right
         */
        function associativity(op) {
            switch (op) {
                case OP.SUB: case OP.ADD:
                    return -1;
                case OP.DIV: case OP.E_PROD: case OP.I_PROD:
                    return -1;
                case OP.EXP:
                    return 1;
                default:
                    return 1;
            }
        }

        function precedence(op) {
            if (op.length === 1) {
                switch (op) {
                    case OP.SUB: case OP.ADD:
                        return 1;
                    case OP.E_PROD: case OP.DIV: case OP.I_PROD:
                        return 2;
                    case OP.EXP:
                        return 4;
                }
            }
            if (op.charAt(0) === UNARY_DELIM) {
                if (op === UNARY_MINUS || op === UNARY_PLUS)
                    return 3;   //-5^2 evaluates correctly
                return 5;
            }
            return TYPE.OPERAND;
        }

        function getType(token) {
            switch (token) {
                case TOKEN.LEFT_PAREN: return TYPE.LEFT_PAREN;
                case TOKEN.RIGHT_PAREN: return TYPE.RIGHT_PAREN;
                case TOKEN.LEFT_SQUARE: return TYPE.LEFT_SQUARE;
                case TOKEN.RIGHT_SQUARE: return TYPE.RIGHT_SQUARE;
            }
            if (token === TOKEN.LEFT_PAREN) {
                return TYPE.LEFT_PAREN;
            }
            if (token === TOKEN.RIGHT_PAREN) {
                return TYPE.RIGHT_PAREN;
            }
            return precedence(token);
        }

        function shuntingYard(array) {

            let operators = new Stack();
            let output = [];

            for (let i = 0; i < array.length; i++) {
                let token = array[i];
                let type = getType(token);
                if (type === TYPE.OPERAND) {
                    //number
                    output.push(token);
                } else if (type === TYPE.LEFT_PAREN) {
                    operators.push(token);
                } else if (type === TYPE.RIGHT_PAREN) {
                    let operator = operators.pop();
                    while (operator !== TOKEN.LEFT_PAREN) {
                        if (operators.isEmpty()) {
                            throw new Error("Mismatched parenthesis");
                        }
                        output.push(operator);
                        operator = operators.pop();
                    }
                } else if (type === TYPE.LEFT_SQUARE) {
                    operators.push(token);
                } else if (type === TYPE.RIGHT_SQUARE) {
                    let operator = operators.pop();
                    while (operator !== TOKEN.LEFT_SQUARE) {
                        if (operators.isEmpty()) {
                            throw new Error("Mismatched squares");
                        }
                        output.push(operator);
                        operator = operators.pop();
                    }
                } else {
                    //Operator
                    let op = operators.peek();
                    while (!operators.isEmpty() && (precedence(op) > precedence(token) || (associativity(op) === -1) && precedence(op) === precedence(token))) {
                        output.push(operators.pop());
                        op = operators.peek();
                    }
                    operators.push(token);
                }
            }
            while (!operators.isEmpty()) {
                let op = operators.pop();
                if (op === TOKEN.LEFT_PAREN) {
                    throw new Error("Mismatched parenthesis");
                }
                output.push(op);
            }
            return output;
        }

        function objectify(array) {

            function isUnary(token) {
                return token.charAt(0) === UNARY_DELIM;
            }

            let operands = new Stack();
            for (let i = 0; i < array.length; i++) {
                let token = array[i];
                let type = getType(token);
                if (type === TYPE.OPERAND) {
                    operands.push(new QElement(token));
                } else {
                    if (isUnary(token)) {
                        let op = operands.pop();
                        if (token === UNARY_PLUS) {
                            operands.push(op);
                        } else if (token === UNARY_MINUS) {
                            operands.push(new QNegated(op));
                        } else if (token.includes("abs")) {
                            operands.push(new QAbsolute(op));
                        } else if (token === (UNARY_DELIM + FUNCTIONS.IDENTITY + UNARY_DELIM)) {
                            operands.push(new QIdentity(op));
                        } else {
                            operands.push(new QFunction(token.slice(1, -1), op));
                        }
                    } else {
                        let op2 = operands.pop();
                        let op1 = operands.pop();
                        switch (token) {
                            case OP.ADD:
                                if (op1 instanceof QAddition) {
                                    op1.insert(op2);
                                    operands.push(op1);
                                } else {
                                    let add = new QAddition();
                                    add.add(op1);
                                    add.add(op2);
                                    operands.push(add);
                                }
                                break;
                            case OP.SUB:
                                if (op2 instanceof QAddition) {
                                    op2.insert(op1, false);
                                    operands.push(op2);
                                } else {
                                    let add = new QAddition();
                                    add.add(op1);
                                    add.add(op2, false);
                                    operands.push(add);
                                }
                                break;
                            case OP.E_PROD:
                                if (op1 instanceof QProduct && op1.explicit === true) {
                                    op1.insert(op2);
                                    operands.push(op1);
                                } else {
                                    operands.push(new QProduct([op1, op2]));
                                }
                                break;
                            case "@":
                                if (op1 instanceof QProduct && op1.explicit === false) {
                                    op1.insert(op2);
                                    operands.push(op1);
                                } else {
                                    operands.push(new QProduct([op1, op2], false));
                                }
                                break;
                            case "/":
                                operands.push(new QQuotient(op1, op2));
                                break;
                            case OP.EXP:
                                operands.push(new QExponent(op1, op2));
                                break;
                        }
                    }
                }
            }

            return operands.pop();
        }

        try {
            let escaped = escape(string);
            log("Escaped:\t%o", escaped);

            // Identity function
            let identity = replaceAll(escaped, TOKEN.LEFT_SQUARE, UNARY_DELIM + FUNCTIONS.IDENTITY + UNARY_DELIM + TOKEN.LEFT_PAREN);
            identity = replaceAll(identity, TOKEN.RIGHT_SQUARE, TOKEN.RIGHT_PAREN);
            log("Identity:\t%o", identity);

            let product = implicitProduct(identity);
            log("Product:\t%o", product);

            let tokens = tokenize(product);
            log("Tokens:\t%o", tokens);

            let shunted = shuntingYard(tokens);
            log("Reverse Polish:\t%o", shunted);

            let obj = objectify(shunted);
            log("Object:\t%o", obj);


            return obj;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    function parseLatex(latex) {
        return parse(latexToBasic(latex));
    }

    function latexToBasic(string) {

        function isNumber(char) {
            return "0" <= char && char <= "9";
        }

        log("Latex:\t%o", string);
        // cdot => *
        let temp = replaceAll(string, "\\cdot", OP.E_PROD);
        // |...| => abs(...)
        temp = replaceAll(temp, "\\left|", "abs" + TOKEN.LEFT_PAREN);
        temp = replaceAll(temp, "\\right|", TOKEN.RIGHT_PAREN);

        // replace fractions
        while (true) {
            let frac = temp.indexOf("\\frac");
            if (frac === -1)
                break;
            //remove the found frac
            temp = temp.replace("\\frac", "");
            let parens = new ParenState();
            let count = 0;
            for (let i = frac; i < temp.length; i++) {
                //Find the first bracket wrap, and the second
                let char = temp.charAt(i);
                if (char === "{") {
                    if (parens.isClear()) {
                        if (count === 0) {
                            temp = stringReplace(temp, i, TOKEN.LEFT_PAREN + TOKEN.LEFT_PAREN);
                        } else {
                            //count must be 1
                            temp = stringReplace(temp, i, TOKEN.LEFT_PAREN);
                        }
                    }
                    parens.inc();
                } else if (char === "}") {
                    parens.dec();
                    if (parens.isClear()) {
                        count++;
                        if (count === 1) {
                            temp = stringReplace(temp, i, TOKEN.RIGHT_PAREN + "/");
                        } else if (count === 2) {
                            temp = stringReplace(temp, i, TOKEN.RIGHT_PAREN + TOKEN.RIGHT_PAREN);
                            break;
                        }
                    }
                }
            }
            if (count < 2) {
                throw new Error("Mismatched fractions");
            }
        }

        // replace "\operatorname"
        while (true) {
            let operator = temp.indexOf("\\operatorname");
            if (operator === -1) {
                break;
            }
            temp = temp.substr(0, operator) + temp.substr(operator + 14);   //remove \operatorname{
            temp = stringReplace(temp, temp.indexOf("}", operator), "");    //remove the next close bracket "}"
        }

        // remove \left and \right
        temp = replaceAll(temp, "\\left", "");
        temp = replaceAll(temp, "\\right", "");
        // replace log with base
        while (true) {
            let log = temp.lastIndexOf("\\log_");
            if (log === -1)
                break;
            //Capture log base, and numerator
            let logBase = temp.charAt(log+5);
            let logNumIdx = log + 6;
            if (logBase === "{") {
                //capture everything
                let parens = new ParenState();
                logBase = "";
                for (let i = log + 6; i < temp.length; i++) {
                    if (temp.charAt(i) === "{") {
                        parens.inc();
                    } else if (temp.charAt(i) === "}") {
                        if(parens.dec()) {
                            logNumIdx = i + 1;
                            break;
                        }
                    } else {
                        logBase += temp.charAt(i);
                    }
                }
            }
            let logNum = temp.charAt(logNumIdx);
            if (logNum === TOKEN.LEFT_PAREN) {
                //capture everything
                let parens = new ParenState();
                logNum = "";
                for (let i = logNumIdx+1; i < temp.length; i++) {
                    if (temp.charAt(i) === TOKEN.LEFT_PAREN) {
                        parens.inc();
                    } else if (temp.charAt(i) === TOKEN.RIGHT_PAREN) {
                        if (parens.dec()) {
                            logNumIdx = i;
                            break;
                        }
                    } else {
                        logNum += temp.charAt(i);
                    }

                }
            } else if (isNumber(logNum)) {
                while (isNumber(temp.charAt(++logNumIdx))) {
                    logNum += temp.charAt(logNumIdx);
                }
            }
            let formatted = TOKEN.LEFT_SQUARE;
            if (logNum.charAt(0) === TOKEN.LEFT_SQUARE) {
                //numerator is a log as well
                formatted += logNum;
            } else {
                formatted += "log(" + logNum + ")";
            }
            formatted += OP.DIV;
            if (logBase.charAt(0) === TOKEN.LEFT_SQUARE) {
                formatted += logBase;
            } else {
                formatted += "log(" + logBase + ")";
            }
            formatted += TOKEN.RIGHT_SQUARE;
            // replace contents with formatted
            temp = temp.substring(0, log) + formatted + temp.substring(logNumIdx+1);
        }

        // remove \
        temp = replaceAll(temp, "\\", "");
        // brackets -> parens
        temp = replaceAll(temp, "{", TOKEN.LEFT_PAREN);
        return replaceAll(temp, "}", TOKEN.RIGHT_PAREN);
    }

    function stringInsert(string, index, value) {
        return string.substring(0, index) + value + string.substring(index);
    }

    function stringReplace(string, index, newChar) {
        return string.substring(0, index) + newChar + string.substring(index + 1);
    }

    function replaceAll(string, from, to) {
        return string.split(from).join(to);
    }

    //Helper data structures
    function Stack() {
        let array = [];
        function push(... args) {
            return array.push(... args);
        }
        function pop() {
            return array.pop();
        }
        function peek() {
            return array[array.length - 1];
        }
        function size() {
            return array.length;
        }
        function isEmpty() {
            return array.length === 0;
        }
        return {
            push: push,
            pop: pop,
            peek: peek,
            size: size,
            isEmpty: isEmpty
        }
    }

    function StringBuilder() {

        let chars = [];

        function append(char) {
            chars.push(char);
        }

        function build() {
            return chars.join("");
        }

        function clear() {
            chars = [];
        }

        return {
            append: append,
            build: build,
            isEmpty: () => {return chars.length === 0},
            clear: clear,
        }
    }

    function ArrayBuilder() {
        let array = [];
        let current = new StringBuilder();

        /**
         * Adds a character to the current stringbuilder
         * @param char
         */
        function add (char) {
            current.append(char);
        }

        /**
         * Inserts the result of the current stringbuilder to the array,
         *  and clears it
         */
        function next () {
            if (!current.isEmpty()) {
                array.push(current.build());
                current.clear();
            }
        }

        /**
         * Inserts a character into the array
         */
        function append (str) {
            next(); // add anything current first
            array.push(str);
        }


        function finish () {
            next();
            return array;
        }

        return {
            add: add,
            next: next,
            append: append,
            finish: finish,
        }
    }

    function ParenState() {
        let depth = 0;
        function inc() {
            return depth++;
        }
        function dec() {
            return --depth;
        }
        function isClear() {
            return depth === 0;
        }
        return {
            inc: inc,
            dec: dec,
            isClear: isClear
        }
    }

    function dev(enabled) {
        if (enabled === undefined || enabled === null) {
            enabled = true;
        }
        log = enabled ? on : off;
    }

    return {
        format: format,
        parse: parse,
        formatLatex: formatLatex,
        parseLatex: parseLatex,
        latexToBasic: latexToBasic,
        functions: function() {return FUNCTIONS},
        functionsArray: function() {
            return FUNC_ARRAY;
        },
        dev: dev
    }
};

QuickMath.dev();