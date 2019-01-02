window.addEventListener("load", function() {
    const icon = document.getElementById("toolbar-toggle-icon");
    const content = $("#toolbar-content");

    /**
     * Content collapse animations
     */

    content.collapse();
    content.on("show.bs.collapse", function() {
        icon.classList.add("inverted");
    });
    content.on("hide.bs.collapse", function() {
        content.css("overflow", "hidden");
        icon.classList.remove("inverted");
    });

    /**
     * Initialize toolbar buttons
     */
    const BUTTONS = [
        ["π", "pi"],
        ["θ", "theta"],
        ["√", "sqrt"],
        ["|a|", "|"],
    ];

    const buttons = document.getElementById("toolbar-buttons");
    BUTTONS.forEach((elem) => {
        let btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("btn", "btn-light");
        btn.innerText = elem[0];
        btn.addEventListener("click", function() {
            QuillInterface.command(elem[1]);
        });
        buttons.appendChild(btn);
    });

    /**
     * Initialize toolbar functions
     */
    const ddWrapper = document.createElement("div");
    ddWrapper.classList.add("btn-group");
    ddWrapper.role = "group";
    const ddToggle = document.createElement("button");
    ddToggle.classList.add("btn", "btn-light", "dropdown-toggle");
    ddToggle.type = "button";
    ddToggle.dataset.toggle = "dropdown";
    ddToggle.setAttribute("aria-haspopup", "true");
    ddToggle.setAttribute("aria-expanded", "false");
    ddToggle.innerText = "Functions";

    const ddMenu = document.createElement("div");
    ddMenu.classList.add("dropdown-menu");
    ddMenu.style.maxHeight = "200px";
    ddMenu.style.overflowY = "auto";
    const EXCLUDED = new Set(["sqrt", "abs"]);
    QuickMath.functions().forEach((func) => {
        if (!EXCLUDED.has(func)) {
            let btn = document.createElement("button");
            btn.classList.add("dropdown-item");
            btn.type = "button";
            btn.innerText = func;
            btn.addEventListener("click", function() {
                QuillInterface.command(func + "(");
            });
            ddMenu.appendChild(btn);
        }
    });
    ddWrapper.appendChild(ddToggle);
    ddWrapper.appendChild(ddMenu);
    buttons.appendChild(ddWrapper);

    // Workaround for dropdown inside collapse
    content.on("shown.bs.collapse", function() {
        content.css("overflow", "visible");
    });
});