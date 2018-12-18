document.addEventListener('DOMContentLoaded', () => {
    const FORM_UI = document.getElementById('interfaceForm');
    const BANNER = document.getElementById('banner');
    const BANNER_DURATION = 1000;   //1000ms

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

        WHITELIST.addEventListener("blur", () => {
            if (selected !== null) {
                selected.classList.remove('selected');
                selected = null;
            }
        });

        return {
            render: render,
            add: add,
            remove: remove,
            addAll: addAll,
            getArray: getArray
        }
    };

    // Restore options
    chrome.storage.sync.get({
        //Default ui_type is MODAL
        ui_type: 0,
        whitelist: []
    }, function (items) {
        FORM_UI.querySelectorAll('input[name="interface"]')[items.ui_type].checked = true;
        WhitelistManager.addAll(items.whitelist);
    });

    FORM_UI.addEventListener("submit", function (e) {
        e.preventDefault();
        chrome.storage.sync.set({
            ui_type: FORM_UI.interface.value,
            whitelist: WhitelistManager.getArray()
        }, function() {
            showBanner("Interface options saved.");
        });
    });

    function showBanner(message) {
        BANNER.innerText = message;
        let margin = BANNER.style.marginTop;
        BANNER.style.marginTop = 0;
        setTimeout(() => {
            //Restore the margin
            BANNER.style.marginTop = margin;
        }, BANNER_DURATION);
    }

    document.getElementById("addWhitelistButton").addEventListener("click", () => {
        let url = prompt("Enter a website url");
        WhitelistManager.add(url);
    });

    document.getElementById("removeWhitelistButton").addEventListener("click", () => {
        WhitelistManager.remove();
    });
});