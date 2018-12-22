chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.executeScript(null, {file: "js/inject.js"});
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // noinspection EqualityComparisonWithCoercionJS
    if (tab.url != undefined && tab.url != null && changeInfo.status === "complete") {
        try {
            let url = new URL(tab.url);
            if (url.origin.includes("webwork.elearning")) {
                chrome.tabs.executeScript(tabId, {file: "js/inject.js"});
            }
        } catch (e) {
            console.error("Error: "+ e + " with url: " + tab.url);
        }
    }
});