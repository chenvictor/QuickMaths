chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(null, {file: "js/inject.js"});
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        let url = new URL(tab.url);
        if (url.origin.includes("webwork.elearning")) {
            chrome.tabs.executeScript(tabId, {file: "js/inject.js"});
        }
    }
});