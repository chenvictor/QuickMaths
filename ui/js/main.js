window.addEventListener("load", () => {
    const MQuill = MathQuill.getInterface(2);
    let elem = document.getElementById("mathQuill");

    const mathField = MQuill.MathField(elem, {
        spaceBehavesLikeTab: true,
        autoCommands: 'pi theta sqrt',
        autoOperatorNames: 'sin cos tan',
        handlers: {
            enter: function () {
                send();
            },
        }
    });

    const wrapper = document.getElementById("wrapper");
    wrapper.addEventListener("click", escape);
    document.getElementById("okBtn").addEventListener("click", send);
    document.getElementById("closeBtn").addEventListener("click", escape);
    const content = document.getElementById("content");
    content.addEventListener("click", function (e) {
        // Absorb clicks to the backdrop
        e.stopPropagation();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            escape();
        }
    });

    function escape() {
        top.postMessage({
            type: -1
        }, "*");
    }

    function send() {
        top.postMessage({
            type: 1,
            input: QuickMath.latexToBasic(mathField.latex()),
        }, "*");
    }

    addEventListener("message", function (event) {
        if (event.data.hasOwnProperty("type") && event.data.type === 0) {
            passInput(event.data.input);
        }
    });

    function passInput(input) {
        let parsed = QuickMath.parse(input);
        let latex = QuickMath.formatLatex(parsed);
        mathField.latex(latex);
        mathField.focus();
    }
});