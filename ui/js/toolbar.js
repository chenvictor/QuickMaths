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

    function createDropdown(name, addItems) {
        let dd = document.createElement("div");
        dd.classList.add("btn-group");
        dd.role = "group";
        let toggle = document.createElement("button");
        toggle.classList.add("btn", "btn-light", "dropdown-toggle");
        toggle.type = "button";
        toggle.dataset.toggle = "dropdown";
        toggle.setAttribute("aria-haspopup", "true");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerText = name;
        let menu = document.createElement("div");
        menu.classList.add("dropdown-menu");
        menu.style.maxHeight = "250px";
        menu.style.overflowY = "auto";
        addItems(menu);
        dd.appendChild(toggle);
        dd.appendChild(menu);
        return dd;
    }
    function createDropBtn(text, toType) {
        let btn = document.createElement("button");
        btn.classList.add("dropdown-item");
        btn.type = "button";
        btn.innerText = text;
        btn.addEventListener("click", function() {
            QuillInterface.command(toType);
        });
        return btn;
    }
    /**
     * Initialize toolbar functions
     */
    buttons.appendChild(
        createDropdown("Functions", function(menu) {
            const EXCLUDED = new Set(["sqrt", "abs"]);
            QuickMath.functions().NUMERIC.forEach((func) => {
                if (!EXCLUDED.has(func)) {
                    menu.appendChild(createDropBtn(func, func+"("));
                }
            });
        }));
    buttons.appendChild(
        createDropdown("Trig", function(menu) {
            QuickMath.functions().TRIG.forEach((func) => {
                    menu.appendChild(createDropBtn(func, func+"("));
            });
        }));
    buttons.appendChild(
        createDropdown("Inverse", function(menu) {
            QuickMath.functions().I_TRIG.forEach((func) => {
                if (func.length > 4) {
                    menu.appendChild(createDropBtn(func, func + "("));
                }
            });
        }));
    buttons.appendChild(
        createDropdown("Hyperbolic", function(menu) {
            QuickMath.functions().H_TRIG.forEach((func) => {
                menu.appendChild(createDropBtn(func, func+"("));
            });
        }));
    buttons.appendChild(
        createDropdown("Inverse Hyperbolic", function(menu) {
            QuickMath.functions().IH_TRIG.forEach((func) => {
                if (func.length > 6) {
                    menu.appendChild(createDropBtn(func, func + "("));
                }
            });
        }));



    // Workaround for dropdown inside collapse
    content.on("shown.bs.collapse", function() {
        content.css("overflow", "visible");
    });
});