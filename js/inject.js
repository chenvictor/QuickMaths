if (document.getElementById("suchARandomIdwhywould131anyonepickthis124") != null) {
    //already injected

} else {

    console.log("Hello");

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
        btn.classList.add("majestic");
        btn.addEventListener("click", e => {
            e.preventDefault();
            showFrame(input);
        });
        input.parentNode.insertBefore(btn, input.nextSibling);
        // input.append(btn);
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
                    // console.log("input: %s", input);
                    setInput(input);
                case -1:                            //Fallthrough switch
                    hideFrame();
                    return;
            }
        }
        console.warn("Received message: %o", event.data);
    });

    let GLOBAL_INPUT;

    function showFrame(input) {
        GLOBAL_INPUT = input;
        // console.log("Showing frame");

        frame.contentWindow.postMessage({
            type: 0,
            input: input.value,
        }, "*");

        frame.style.display = "inline";
        setTimeout(() => {
            frame.style.opacity = "1";
        }, 5);
    }

    function setInput(value) {
        GLOBAL_INPUT.value = value;
    }

    function hideFrame() {
        // console.log("Hiding frame");
        frame.style.opacity = "0";
        setTimeout(() => {
            frame.style.display = "none";
        }, 250);
    }
}