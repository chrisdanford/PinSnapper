'use strict';

function onPageActionClicked(tab) {
    console.log('onPageActionClicked', tab.id);
    var currentTabId = tab.id;
    chrome.tabs.captureVisibleTab(null, function(dataUri) {
        chrome.tabs.sendRequest(currentTabId, {
            action: 'pinSnap',
            screenshotDataUri: dataUri
        });
    });
}

function onTabUpdated(tabId, changeInfo) {
    console.log('onTabUpdated', tabId, changeInfo);
    chrome.pageAction.show(tabId);
}

chrome.pageAction.onClicked.addListener(onPageActionClicked);

chrome.tabs.onUpdated.addListener(onTabUpdated);
