const RANDOM_ID = "suchARandomIdwhywould131anyonepickthis124";

if (document.getElementById(RANDOM_ID) == null) {
    let inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        if (input.type === 'text') {
            inject(input);
        }
    }

    let uiFrame;

// Injects buttons onto the inputs
    function inject(input) {
        let btn = document.createElement('button');

        btn.innerText = "QM";
        btn.style = `
            transition: opacity 0.25s ease-in-out;
            opacity: 0;
            position: absolute;
            z-index: 100;
            background-color: skyblue;
            border: none;
            border-radius: 6px;
            top: 0;
            left: 0;
            cursor: pointer;
        `;
        btn.tabIndex = -1;  //don't want the user to tab to here
        btn.addEventListener("click", e => {
            e.preventDefault();
            uiFrame.show(input);
        });
        input.parentNode.insertBefore(btn, input.nextSibling);

        input.addEventListener('focus', () => {
            let rect = input.getBoundingClientRect();
            let btnHeight = btn.getBoundingClientRect().height;
            let rectHeight = (rect.top - rect.bottom);
            let margin = (-btnHeight - rectHeight) / 2;
            let text = "translate(" + Math.round(rect.right + document.documentElement.scrollLeft + 5) + "px , " +
                Math.round(margin + rect.top + document.documentElement.scrollTop) +"px)";
            btn.style.transform = text;
            // console.log("Transform to: %s", text);
            btn.style.opacity = "1";
        });

        input.addEventListener('blur', () => {
            btn.style.opacity = "0";
        });
        if (document.activeElement === input) {
            //Refocus to show QM
            input.blur();
            setTimeout(() => {
                input.focus();
            }, 5);
        }
    }

    const UI_MODAL = 0;
    const UI_BAR = 1;
    const FRAME_TYPE = UI_MODAL;


    let GLOBAL_INPUT;

    switch (FRAME_TYPE) {
        case UI_MODAL:
            uiFrame = new ModalUI();
            break;
        case UI_BAR:
            uiFrame = new BarUI();
            break;
    }
}

function ModalUI() {
    let curInput;

    const frame = document.createElement("iframe");
    frame.id = "suchARandomIdwhywould131anyonepickthis124";

    frame.style = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 100;
            border: none;
            background-color: transparent;
            transition: opacity 0.25s ease-in-out;
            opacity: 0;
            display: none;
        `;

    frame.src = chrome.extension.getURL("ui/modal.html");
    frame.allowTransparency = true;
    document.body.appendChild(frame);

    addEventListener("message", function (event) {
        if (event.data.hasOwnProperty("type")) {
            let type = event.data.type;
            // noinspection FallThroughInSwitchStatementJS
            switch (type) {
                case 1:
                    let input = event.data.input;
                    curInput.value = input;
                case -1:                            //Fallthrough switch
                    hide();
                    curInput.focus();
                    return;
            }
        }
        console.warn("Received message: %o", event.data);
    });

    function show(input) {
        curInput = input;

        frame.contentWindow.postMessage({
            type: 0,
            input: input.value,
        }, "*");

        frame.style.display = "inline";
        setTimeout(() => {
            frame.style.opacity = "1";
        }, 5);  //small delay to allow CSS to transition properly
    }

    function hide() {
        frame.style.opacity = "0";
        setTimeout(() => {
            frame.style.display = "none";
        }, 250);
    }
    return {
        show: show,
        hide: hide
    }
}

function BarUI() {
    let curInput;

    const frame = document.createElement("iframe");
    frame.id = "suchARandomIdwhywould131anyonepickthis124";

    frame.scrolling = "no";
    frame.style = `
            position: fixed;
            bottom: 0;
            left: 0;
            height: 100%;
            width: 100%;
            z-index: 100;
            border: none;
            transition: opacity 0.25s ease-in-out;
            opacity: 0;
            background: none;
            display: none;
        `;

    frame.src = chrome.extension.getURL("ui/bar.html");
    frame.allowTransparency = true;
    document.body.appendChild(frame);

    addEventListener("message", function (event) {
        if (event.data.hasOwnProperty("type")) {
            let type = event.data.type;
            // noinspection FallThroughInSwitchStatementJS
            switch (type) {
                case 1:
                    let input = event.data.input;
                    curInput.value = input;
                case -1:                            //Fallthrough switch
                    hide();
                    curInput.focus();
                    return;
            }
        }
        console.warn("Received message: %o", event.data);
    });

    function show(input) {
        curInput = input;

        frame.allowTransparency = true;
        frame.contentWindow.postMessage({
            type: 0,
            input: input.value,
        }, "*");

        frame.style.display = "inline";
        setTimeout(() => {
            frame.style.opacity = "1";
        }, 5);  //small delay to allow CSS to transition properly
    }

    function hide() {
        frame.style.opacity = "0";
        setTimeout(() => {
            frame.style.display = "none";
        }, 250);
    }
    return {
        show: show,
        hide: hide
    }
}