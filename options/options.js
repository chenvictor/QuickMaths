document.addEventListener('DOMContentLoaded', () => {
    const FORM_UI = document.getElementById('form');
    const BANNER = document.getElementById('banner');
    const BANNER_DURATION = 1000;   //1000ms

    const FONT_SIZE_SELECTOR = document.getElementById("fontSizeSelector");
    const span = document.getElementById("fontValue");
    const preview = document.getElementById("mathPreview");

    const WhitelistManager = new function() {
        const WHITELIST = document.getElementById("whitelist");
        let urlSet = new Set();
        let selected = null;

        function render() {
            WHITELIST.innerHTML = "";
            for (let s of urlSet) {
                let elem = document.createElement("li");
                elem.innerText = s;
                if (selected !== null && s === selected.innerText) {
                    elem = selected;
                    elem.classList.add('selected');
                }
                elem.addEventListener("click", () => {
                    if (selected !== null) {
                        selected.classList.remove('selected');
                    }
                    selected = elem;
                    selected.classList.add('selected');
                });
                WHITELIST.appendChild(elem);
            }
        }

        function add(url) {
            urlSet.add(url);    //add the new url
            render();           //re-render the list
        }

        function addAll(array) {
            array.forEach(x=>{urlSet.add(x)});
            render();
        }

        function remove() {
            if (selected !== null) {
                urlSet.delete(selected.innerText);
                selected = null;
                render();
            }
        }

        function getArray() {
            return Array.from(urlSet);
        }

        document.getElementById("addWhitelistButton").addEventListener("click", () => {
            let url = prompt("Enter a domain url filter");
            WhitelistManager.add(url);
        });

        document.getElementById("removeWhitelistButton").addEventListener("click", () => {
            WhitelistManager.remove();
        });

        return {
            render: render,
            add: add,
            remove: remove,
            addAll: addAll,
            getArray: getArray
        }};

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
        whitelist: ["webwork.elearning"]
    }, function (items) {
        FORM_UI.querySelectorAll('input[name="interface"]')[items.ui_type].checked = true;
        FONT_SIZE_SELECTOR.value = items.font_size;
        span.innerText = items.font_size;
        preview.style.fontSize = items.font_size + "px";
        WhitelistManager.addAll(items.whitelist);
    });

    FORM_UI.addEventListener("submit", function (e) {
        e.preventDefault();
        chrome.storage.sync.set({
            ui_type: FORM_UI.interface.value,
            font_size: FONT_SIZE_SELECTOR.value,
            whitelist: WhitelistManager.getArray()
        }, function() {
            showBanner("Settings saved.");
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