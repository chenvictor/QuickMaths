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
    }

    function QAbsolute(_part) {
        this.type = 7;
        this.part = _part;
    }

    /**
     * Constants used
     */
    const OPERATORS = ["+", "-", "*", "/", "^"];
    const CONST_ARRAY = ["theta", "pi"];
    const CONST_DELIM = '#';
    const FUNC_ARRAY = ["sqrt", "sec", "csc", "cot", "log",
                        "ln", "asin", "acos", "atan",
                        "sin", "cos", "tan", "abs"];
    const UNARY_DELIM = '$';
    const UNARY_MINUS = UNARY_DELIM + '-' + UNARY_DELIM;
    const UNARY_PLUS = UNARY_DELIM + '+' + UNARY_DELIM;

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
        let ret;
        switch (qe.type) {
            case 0:
                if (qe.part.charAt(0) === CONST_DELIM) {
                    ret = qe.part.slice(1, -1);
                }
                ret = qe.part;
                if (parenLevel === 1) {
                    parenLevel = 0; //skip parens
                }
                break;
            case 1:
                ret = "-" + format(qe.part, 1);
                break;
            case 2:
                let temp = [];
                temp.push(format(qe.parts[0]));
                for (let i = 1; i < qe.parts.length; i++) {
                    temp.push(qe.signs[i] ? "+" : "-");
                    temp.push(format(qe.parts[i]));
                }
                ret = temp.join("");
                break;
            case 3:
                ret = qe.parts.map(function(x) {return format(x, 1)}).join("*");
                break;
            case 4:
                ret = format(qe.numerator, 1) + "/" + format(qe.denominator, 1);
                break;
            case 5:
                ret = format(qe.base, 1) + "^" + format(qe.power, 1);
                break;
            case 6:
                ret = qe.name + format(qe.part, 2);
                if (ret === 1) {
                    ret = 0;
                }
                break;
            case 7:
                ret = "abs" + format(qe.part, 2);
                if (ret === 1) {
                    ret = 0;
                }
                break;
            default:
                throw new Error("Unknown element type: " + qe);
        }
        return parenLevel > 0 ? "(" + ret + ")" : ret;
    }

    /**
     * Formats a quick element into a latex string
     * @param qe            element to format
     * @param parenLevel    level of paren wrapping required by the parent element
     *              DEFAULT 0 - not required,               eg. 5 always
     *                      1 - necessary for order of ops  eg. -5, but -(1+2)
     *                                                          1+2, but (1+2) / 3
     *                      2 - required                    eg. \sin(5) always
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

        //Special operators that MathQuill requires the use of the \operatorname tag
        const opSet = new Set(["asin", "acos", "atan"]);

        let ret;
        switch (qe.type) {
            case 0:
                let output = qe.part;
                for (let i = 0; i < CONST_ARRAY.length; i++) {
                    output = replaceAll(output, CONST_DELIM + CONST_ARRAY[i] + CONST_DELIM, "\\" + CONST_ARRAY[i]);
                }
                ret = output;
                if (parenLevel === 1) {
                    parenLevel = 0;
                }
                break;
            case 1:
                ret = "-" + formatLatex(qe.part, 1);
                break;
            case 2:
                let temp = [];
                temp.push(formatLatex(qe.parts[0]));
                for (let i = 1; i < qe.parts.length; i++) {
                    temp.push(qe.signs[i] ? "+" : "-");
                    temp.push(formatLatex(qe.parts[i]));
                }
                ret = temp.join("");
                break;
            case 3:
                ret = qe.parts.map(function (x) {
                    return formatLatex(x, 1);
                }).join("\\cdot ");
                break;
            case 4:
                ret = "\\frac" + bracketWrap(formatLatex(qe.numerator)) + bracketWrap(formatLatex(qe.denominator));
                break;
            case 5:
                ret = formatLatex(qe.base, 1) + "^" + bracketWrap(formatLatex(qe.power));
                break;
            case 6:
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
            default:
                console.error("Unknown element type: %o", qe);
                throw new Error("");
        }
        return parenLevel > 0 ? "\\left(" + ret + "\\right)" : ret;
    }

    function parse(string) {

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
            if (result.charAt(0) === '-') {
                result = UNARY_MINUS + result.substring(1);
            } else if (result.charAt(0) === '+') {
                result = UNARY_PLUS + result.substring(1);
            }

            result = replaceAll(result, "(-", "(" + UNARY_MINUS);
            result = replaceAll(result, "(+", "(" + UNARY_PLUS);
            for (let op of OPERATORS) {
                result = replaceAll(result, op + "-", op + UNARY_MINUS);
                result = replaceAll(result, op + "+", op + UNARY_PLUS);
            }
            return result;
        }

        function implicitProduct(string) {
            let evenEscape = true;
            for (let i = string.length - 1; i > 0; i--) {
                let curr = string.charAt(i);
                let prev = string.charAt(i-1);
                if (curr === "(") {
                    if (prev === CONST_DELIM || (getType(prev) <= 0 && prev !== "(")) {
                        //Not an operator
                        string = stringInsert(string, i, "*");
                    }
                } else if (prev === ")") {
                    if (curr === CONST_DELIM || (getType(curr) <= 0 && curr !== ")")) {
                        //Not an operator
                        string = stringInsert(string, i, "*");
                    }
                } else if (curr === CONST_DELIM && prev === CONST_DELIM) {
                    string = stringInsert(string, i, "*");
                } else if (curr === UNARY_DELIM) {
                    if (evenEscape) {
                        evenEscape = false;
                    } else {
                        evenEscape = true;
                        if (prev === CONST_DELIM || (getType(prev) <= 0 && prev !== "(")) {
                            //Not an operator
                            string = stringInsert(string, i, "*");
                        }
                    }
                }
            }
            return string;

        }

        function tokenize(string) {

            function charType(char) {
                const SINGLES = new Set(OPERATORS);
                SINGLES.add("(");
                SINGLES.add(")");
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
            OPERAND: -3
        };

        /**
         * The associativity of an operator
         * @param op
         * @return {number}     -1 for left, 1 for right
         */
        function associativity(op) {
            switch (op) {
                case '-': case '+':
                    return -1;
                case '/': case '*':
                    return -1;
                case "^":
                    return 1;
                default:
                    return 1;
            }
        }

        function precedence(op) {
            if (op.length === 1) {
                switch (op) {
                    case '-': case '+':
                        return 1;
                    case '*': case '/':
                        return 2;
                    case UNARY_MINUS: case UNARY_PLUS:
                        return 5;   //-5^2 evaluates correctly
                    case '^':
                        return 4;
                }
            }
            if (op.charAt(0) === UNARY_DELIM) {
                return 5;
            }
            return TYPE.OPERAND;
        }

        function getType(token) {
            if (token === "(") {
                return TYPE.LEFT_PAREN;
            }
            if (token === ")") {
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
                    while (operator !== "(") {
                        if (operators.isEmpty()) {
                            throw new Error("Mismatched parenthesis");
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
                if (op === "(") {
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
                        } else {
                            operands.push(new QFunction(token.slice(1, -1), op));
                        }
                    } else {
                        let op2 = operands.pop();
                        let op1 = operands.pop();
                        switch (token) {
                            case "+":
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
                            case "-":
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
                            case "*":
                                if (op1 instanceof QProduct) {
                                    op1.insert(op2);
                                    operands.push(op1);
                                } else {
                                    operands.push(new QProduct([op1, op2]));
                                }
                                break;
                            case "/":
                                operands.push(new QQuotient(op1, op2));
                                break;
                            case "^":
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

            let product = implicitProduct(escaped);
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
        log("Latex:\t%o", string);
        // cdot => *
        let temp = replaceAll(string, "\\cdot", "*");
        // |...| => abs(...)
        temp = replaceAll(temp, "\\left|", "abs(");
        temp = replaceAll(temp, "\\right|", ")");

        // replace fractions
        while (true) {
            let frac = temp.indexOf("\\frac");
            if (frac === -1) {
                break;
            }
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
                            temp = stringReplace(temp, i, "((");
                        } else {
                            //count must be 1
                            temp = stringReplace(temp, i, "(");
                        }
                    }
                    parens.inc();
                } else if (char === "}") {
                    parens.dec();
                    if (parens.isClear()) {
                        count++;
                        if (count === 1) {
                            temp = stringReplace(temp, i, ")/");
                        } else if (count === 2) {
                            temp = stringReplace(temp, i, "))");
                            break;
                        }
                    }
                }
            }
            if (count < 2) {
                throw new Error("Mismatched fractions");
            }
        }

        // replace '\operatorname'
        while (true) {
            let operator = temp.indexOf("\\operatorname");
            if (operator === -1) {
                break;
            }
            temp = temp.substr(0, operator) + temp.substr(operator + 14);   //remove \operatorname{
            temp = stringReplace(temp, temp.indexOf("}", operator), "");    //remove the next close bracket '}'
        }

        // remove \left and \right
        temp = replaceAll(temp, "\\left", "");
        temp = replaceAll(temp, "\\right", "");
        // remove \
        temp = replaceAll(temp, "\\", "");
        // brackets -> parens
        temp = replaceAll(temp, "{", "(");
        return replaceAll(temp, "}", ")");
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
        dev: dev
    }
};
QuickMath.dev(true);