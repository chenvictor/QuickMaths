function encapsulate() {
    const RANDOM_ID = "suchARandomIdwhywould131anyonepickthis124";

    if (document.getElementById(RANDOM_ID) == null) {
        let inputs = document.getElementsByTagName('input');
        let inputFound = false;
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            if (input.type === 'text') {
                inject(input);
                inputFound = true;
            }
        }

        let globalInput = null;
        let uiFrame;

        if (inputFound) {
            chrome.storage.sync.get({
                //Default ui_type is MODAL
                ui_type: 0,
            }, (items) => {

                switch (items.ui_type) {
                    case "0":
                        uiFrame = ModalUI();
                        break;
                    case "1":
                        uiFrame = BarUI();
                        break;
                }
            });
        }

        function performShow() {
            if (globalInput !== null) {
                uiFrame.show(globalInput);
            }
        }

        // Injects buttons onto the inputs
        function inject(input) {
            let btn = document.createElement('button');

            btn.innerText = "WW+";
            btn.style = `
            transition: opacity 0.25s ease-in-out;
            opacity: 0;
            position: absolute;
            z-index: 100;
            padding-top: 4px;
            padding-bottom: 4px;
            background-color: skyblue;
            border: none;
            border-radius: 6px;
            top: 0;
            left: 0;
        `;
            btn.tabIndex = -1;  //don't want the user to tab to here
            btn.addEventListener("click", e => {
                e.preventDefault();
                if (btn.style.opacity !== 0) {
                    performShow();
                }
            });
            input.parentNode.insertBefore(btn, input.nextSibling);

            input.addEventListener('focus', () => {
                let rect = input.getBoundingClientRect();
                let btnHeight = btn.getBoundingClientRect().height;
                let rectHeight = (rect.top - rect.bottom);
                let margin = (-btnHeight - rectHeight) / 2;
                btn.style.transform = "translate(" + Math.round(rect.right + document.documentElement.scrollLeft + 5) + "px , " +
                    Math.round(margin + rect.top + document.documentElement.scrollTop) + "px)";
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
                globalInput = input;
            });

            input.addEventListener('blur', () => {
                setTimeout(() => {
                    btn.style.opacity = "0";
                    btn.style.pointer = "default";
                }, 5);
            });

            if (document.activeElement === input) {
                //Refocus to show QM
                input.blur();
                setTimeout(() => {
                    input.focus();
                }, 5);
            }
        }

        function ModalUI() {
            let curInput;

            const frame = document.createElement("iframe");
            frame.id = RANDOM_ID;

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
            const TRANSITION_DURATION = 0.3;
            let curInput;

            const frame = document.createElement("iframe");
            frame.id = RANDOM_ID;

            frame.scrolling = "no";
            frame.style = `
            position: fixed;
            bottom: -100%;
            left: 0;
            height: 100%;
            width: 100%;
            z-index: 100;
            border: none;
            transition: all ` + TRANSITION_DURATION + `s ease-in-out;
            background: none;
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

                frame.contentWindow.postMessage({
                    type: 0,
                    input: input.value,
                }, "*");

                frame.style.bottom = "0";
            }

            function hide() {
                frame.style.bottom = "-100%";
            }

            return {
                show: show,
                hide: hide
            }
        }
    }
}

encapsulate();