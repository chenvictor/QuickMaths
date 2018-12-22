document.addEventListener('DOMContentLoaded', () => {
    const FORM_UI = document.getElementById('interfaceForm');
    const BANNER = document.getElementById('banner');
    const BANNER_DURATION = 1000;   //1000ms

    const FONT_SIZE_SELECTOR = document.getElementById("fontSizeSelector");
    const span = document.getElementById("fontValue");
    const preview = document.getElementById("mathPreview");

    FONT_SIZE_SELECTOR.addEventListener("input", function () {
        return function(e) {
            let input = e.srcElement;
            let val = input.value;
            span.innerText = val;
            if (val >= input.min && val <= input.max) {
                preview.style.fontSize = val + "px";
            }
        }
    }());

    // Restore options
    chrome.storage.sync.get({
        ui_type: 0,
        font_size: 30,
    }, function (items) {
        FORM_UI.querySelectorAll('input[name="interface"]')[items.ui_type].checked = true;
        FONT_SIZE_SELECTOR.value = items.font_size;
        span.innerText = items.font_size;
        preview.style.fontSize = items.font_size + "px";
    });

    FORM_UI.addEventListener("submit", function (e) {
        e.preventDefault();
        chrome.storage.sync.set({
            ui_type: FORM_UI.interface.value,
            font_size: FONT_SIZE_SELECTOR.value,
        }, function() {
            showBanner("Interface options saved.");
        });
    });

    // Create mathquill preview
    const MQ = MathQuill.getInterface(2);
    MQ.MathField(document.getElementById("mathQuill"), {
        spaceBehavesLikeTab: true,
        autoCommands: 'pi theta sqrt',
        autoOperatorNames: 'sin cos tan',
    }).latex("\\frac{\\sqrt{x+2}}{3} \\cdot \\theta + 2\\pi");

    function showBanner(message) {
        BANNER.innerText = message;
        let margin = BANNER.style.marginTop;
        BANNER.style.marginTop = 0;
        setTimeout(() => {
            //Restore the margin
            BANNER.style.marginTop = margin;
        }, BANNER_DURATION);
    }
});