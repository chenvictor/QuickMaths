const QuickMath = new function() {

    // Object definitions
    function QElement() {
        this.value = null;
    }

    function QAddition() {
        this.parts = [];
    }

    function QProduct() {
        this.parts = [];
    }

    function QQuotient() {
        this.numerator = null;
        this.denominator = null;
    }

    function QExponent() {
        this.base = null;
        this.power = null;
    }

    function parse(_input) {

    }

    return {
        parse: parse,
        setFormat: setFormat
    }
};