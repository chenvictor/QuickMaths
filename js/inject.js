if (document.getElementById("suchARandomIdwhywould131anyonepickthis124") == null) {
    let inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        if (input.type === 'text') {
            inject(input);
        }
    }

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
            showFrame(input);
        });
        input.parentNode.insertBefore(btn, input.nextSibling);

        input.addEventListener('focus', () => {
            let rect = input.getBoundingClientRect();
            let btnHeight = btn.getBoundingClientRect().height;
            let rectHeight = (rect.top - rect.bottom);
            let margin = (-btnHeight - rectHeight) / 2;
            let text = "translate(" + Math.round(rect.right + document.documentElement.scrollLeft + 5) + "px , " +
                Math.round(margin + rect.top + document.documentElement.scrollTop) +"px)";
            btn.style.transform = text
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

//add frame
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

    frame.src = chrome.extension.getURL("main.html");
    frame.allowTransparency = true;
    document.body.appendChild(frame);

    addEventListener("message", function (event) {
        if (event.data.hasOwnProperty("type")) {
            let type = event.data.type;
            // noinspection FallThroughInSwitchStatementJS
            switch (type) {
                case 1:
                    let input = event.data.input;
                    setInput(input);
                case -1:                            //Fallthrough switch
                    hideFrame();
                    GLOBAL_INPUT.focus();
                    return;
            }
        }
        console.warn("Received message: %o", event.data);
    });

    let GLOBAL_INPUT;

    function showFrame(input) {
        GLOBAL_INPUT = input;

        frame.contentWindow.postMessage({
            type: 0,
            input: input.value,
        }, "*");

        frame.style.display = "inline";
        setTimeout(() => {
            frame.style.opacity = "1";
        }, 5);  //small delay to allow CSS to transition properly
    }

    function setInput(value) {
        GLOBAL_INPUT.value = value;
    }

    function hideFrame() {
        frame.style.opacity = "0";
        setTimeout(() => {
            frame.style.display = "none";
        }, 250);
    }


}