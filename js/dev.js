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
    }
}

function QProduct(_parts) {
    this.type = 3;
    this.parts = _parts || [];
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

const BasicFormatter = new function() {

    /**
     * Formats a quick element into basic math
     */
    function format(qe) {
        switch (qe.type) {
            case 0:
                return qe.part;
            case 1:
                return "-" + format(qe.part);
            case 2:
                let temp = [];
                temp.push(format(qe.parts[0]));
                for (let i = 1; i < qe.parts.length; i++) {
                    temp.push(qe.signs[i] ? "+" : "-");
                    temp.push(format(qe.parts[i]));
                }
                return "(" + temp.join("") + ")";
            case 3:
                return qe.parts.map((x) => {return format(x);}).join("*");
            case 4:
                return "(" + format(qe.numerator) + "/" + format(qe.denominator) + ")";
            case 5:
                return format(qe.base) + "^" + format(qe.power);
            default:
                throw new Error("Unknown element type: %o", qe);
        }
    }

    return {
        format: format
    }
};

const BasicParser = new function() {

    const CONSTANTS = new Set(["pi", "e", "theta"]);
    const FUNCTIONS = new Set(["sqrt", "sin", "cos", "tan"]);

    /**
     * Parses basic math into a quick element
     * @param string
     */
    function parse(string) {
        let res = shuntingYard(string);



        return res;
    }

    /**
     * Resolves first order parenthesis in a string
     * @param string    string to preparse
     * @return {Array}  an array separating first order parenthesis.
     *  eg  1 + (1+(2)+3)  ==>   [1, +, 1+(2)+3]
     */
    function preparse(string) {
        let array = [];
        let current = new StringBuilder();
        let parens = new ParenState();
        for (let i = 0; i < string.length; i++) {
            let c = string.charAt(i);
            console.log("Current state: %s", current.build());
            console.log("Parens: %s", parens.isClear() ? "no" : "yes");
            console.log("new char: %s", c);
            if (c === " ") {
                //Ignore spaces
                continue;
            }
            if (c === "(") {
                if (parens.inc() === 0) {
                    if (!current.isEmpty()) {
                        array.push(current.build());
                        current = new StringBuilder();
                    }
                    continue;
                }
            } else if (c === ")") {
                if (parens.dec() === 0) {
                    if (!current.isEmpty()) {
                        array.push(current.build());
                        current = new StringBuilder();
                    }
                    continue;
                }
            } else if (isOperator(c)) {
                // Operators are separated
                if (parens.isClear()) {
                    if (! current.isEmpty()) {
                        array.push(current.build());
                        array.push(c);
                        current = new StringBuilder();
                        continue;
                    }
                }
            }
            console.log("appending: %s", c);
            current.append(c);
        }
        if (!current.isEmpty()) {
            array.push(current.build());
        }
        return array;
    }

    function shuntingYard(string) {

        const TYPE = {
            NUMBER: 0,
            OPERATOR: 1,
        };

        let output = new Queue();
        output.push(new StringBuilder());

        for (let i = 0; i < string.length; i++) {
            let c = string.charAt(i);
            let type = getType(c);
            switch (type) {

            }
        }

        function precedence(op) {
            switch (op) {
                case '-': case '+': return 1;
                case '*': case '/': return 2;
                case '^':           return 3;
                default: return 0;
            }
        }

        function getType(char) {
            if (char.matches(`[.|0-9]`)) {
                return TYPE.NUMBER;
            }
            return TYPE.OPERATOR;
        }
    }



    function isOperator(char) {
        if ("0" <= char && char <= "9") {
            return false;   //number
        }
        if (char === ".") {
            return false;   //.
        }
        if (char.toUpperCase() != char.toLowerCase()) {
            return false;   //letter
        }
        return true;
    }

    return {
        parse: parse,
    }
};

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

function Queue() {
    let array = [];
    function push(... args) {
        return array.push(args);
    }
    function pop() {
        return array.shift();
    }
    function peek() {
        return array[0];
    }
    function size() {
        return array.size();
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

    return {
        append: append,
        build: build,
        isEmpty: () => {return chars.length === 0}
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
        isClear: isClear,
    }
}




//Test values
let _devElement1 = new QElement("69");    //basic number
let _devElement2 = new QElement("c");     //variable name
let _devNegated = new QNegated(_devElement1);
let _devAddition = new QAddition();
_devAddition.add(_devElement1);
_devAddition.add(_devElement2, false);
_devAddition.add(_devElement1);

let _devProduct = new QProduct([_devElement1, _devAddition]);
let _devQuotient = new QQuotient(_devAddition, _devNegated);

let _devExponent = new QExponent(_devElement2, _devAddition);

function _devTest(input) {
    console.log("Input:\t\t%s", input);
    console.log("Parsed:\t\t%o", BasicParser.parse(input));
}
function _devRun() {
    _devTest("1+(2/3)");
    _devTest("2^(5+1)");
    _devTest("(2^5)+1");
    _devTest(".05");
    _devTest("4.05");
}
