document.addEventListener('DOMContentLoaded', () => {
    const FORM_UI = document.getElementById('interfaceForm');
    const BANNER = document.getElementById('banner');
    const BANNER_DURATION = 1000;   //1000ms

    // Restore options
    chrome.storage.sync.get({
        ui_type: 0,
    }, function (items) {
        FORM_UI.querySelectorAll('input[name="interface"]')[items.ui_type].checked = true;
    });

    FORM_UI.addEventListener("submit", function (e) {
        e.preventDefault();
        chrome.storage.sync.set({
            ui_type: FORM_UI.interface.value,
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
});