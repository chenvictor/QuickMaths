let TABS_USING = {};

chrome.browserAction.onClicked.addListener(function(tab) {

    if (TABS_USING.hasOwnProperty(tab)) {
        if (TABS_USING[tab] == true) {
            //uninject code?
            console.log("Already injected");
            // return;
        }
    }
    TABS_USING[tab] = true;
    chrome.tabs.executeScript(null, {file: "js/inject.js"});
});
