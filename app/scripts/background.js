'use strict';

function onPageActionClicked(tab) {
    console.log('onPageActionClicked', tab.id);

    // Hide all "nopin" images before taking a screenshot.
    chrome.tabs.executeScript(tab.id, {file: 'scripts/hide_nopin.js'}, function () {
        chrome.tabs.insertCSS(tab.id, {file: 'styles/hide_nopin.css'}, function () {
            chrome.tabs.captureVisibleTab(null, function(dataUri) {
                // Restore all nopin images after taking the screenshot.
                // TODO: This delay shouldn't be necessary.  Without the delay though
                // nopin images somehow appear in the screenshot
                // even though the screenshot should be complete by the time this
                // function is called.  Investigate and remove the fragile setTimeout.
                setTimeout(function() {
                    chrome.tabs.executeScript(tab.id, {file: 'scripts/show_nopin.js'});
                }, 100);

                chrome.tabs.sendRequest(tab.id, {
                    action: 'pinSnap',
                    screenshotDataUri: dataUri
                });
            });
        });
    });
}

function onTabUpdated(tabId, changeInfo) {
    console.log('onTabUpdated', tabId, changeInfo);
    chrome.pageAction.show(tabId);
}

chrome.pageAction.onClicked.addListener(onPageActionClicked);

chrome.tabs.onUpdated.addListener(onTabUpdated);
