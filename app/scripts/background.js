'use strict';

var currentTabId;
var currentTabIndex;

function onPageActionClicked(tab) {
    currentTabId = tab.id;
    currentTabIndex = tab.index;
    chrome.tabs.captureVisibleTab(null, function(dataUri) {
        chrome.tabs.sendRequest(currentTabId, {
            action: 'pinSnap',
            screenshotDataUri: dataUri
        });
    });
}

function onTabUpdated(tabId, changeInfo) {
    chrome.pageAction.onClicked.removeListener(onPageActionClicked);
    if ('complete' === changeInfo.status) {
        chrome.pageAction.show(tabId);
        chrome.pageAction.onClicked.addListener(onPageActionClicked);
    }
}

chrome.pageAction.onClicked.removeListener(onPageActionClicked);

chrome.tabs.onUpdated.addListener(onTabUpdated);

chrome.tabs.onActiveChanged.addListener(function(activeInfo) {
    currentTabId = activeInfo.tabId;
});
