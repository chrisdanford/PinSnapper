'use strict';

var dragging = false;
var div = null;
var mask = null;
var dimmer = null;
var preview = null;
var snap = null;
var closer = null;
var x = null;
var y = null;
var gotPreview = false;
var snapCoords = null;
var snapCtx = null;
var snapImg = null;

function updateSnapCoords(clientX, clientY) {
    snapCoords = {
        x: Math.min(x, clientX),
        y: Math.min(y, clientY),
        w: Math.max(x, clientX) - Math.min(x, clientX),
        h: Math.max(y, clientY) - Math.min(y, clientY),
    };
    console.log('updateSnapCoords x, y, w, h', snapCoords.x, snapCoords.y, snapCoords.w, snapCoords.h);
}

function uploadImage(pinUrl, snapImageData) {
    function receiveMessage(event) {
        if (event.source !== popup) {
            return;
        }
        if (event.data === 'pinterestReady') {
            var payload = {
                type: 'pinImageData',
                dataUri: snapImageData
            };
            popup.postMessage(payload, '*');
        }
    }
    window.addEventListener('message', receiveMessage, false);
    // TODO: unhook this listener

    var host = 'www.pinterest.com';
    var title = document.title;
    var url = 'http://' + host + '/pin/create/extension/?url=' + encodeURIComponent(pinUrl) + '&description=' + encodeURIComponent(title);
    var popupOptions = 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=632,height=270,left=0,top=0';
    var popup = window.open(url, 'pin' + (new Date()).getTime(), popupOptions);
}

function showPreview(doUpload) {

    Math.round(snapCoords.w * (snapCoords.w / snapCoords.h));
    if (!snap) {
        snap = document.createElement('canvas');
    }
    snap.setAttribute('class', 'selection');
    snap.setAttribute('width', snapCoords.w);
    snap.setAttribute('height', snapCoords.h);
    snap.style.top = snapCoords.y - 1 + 'px';
    snap.style.left = snapCoords.x - 1 + 'px';
    div.appendChild(snap);
    snap.addEventListener('click', function () {
        div.removeChild(this);
        gotPreview = false;
    });
    snapCtx = snap.getContext('2d');
    snapCtx.drawImage(snapImg, snapCoords.x, snapCoords.y, snapCoords.w, snapCoords.h, 0, 0, snapCoords.w, snapCoords.h);

    if (doUpload) {
        var snapImageData = snap.toDataURL('image/jpeg');
        uploadImage(window.location.href, snapImageData);
        close();
    }

    gotPreview = true;
}

function onMouseUp(evt) {
    dragging = false;
    updateSnapCoords(evt.clientX, evt.clientY);

    showPreview(true);

    closer.classList.remove('hidden');
}

function onMouseDown(evt) {
    dragging = true;
    closer.classList.add('hidden');
    if (snap) {
        div.removeChild(snap);
        snap = null;
    }
    x = evt.clientX;
    y = evt.clientY;
    snapCoords = null;
}

function onMouseMove(evt) {
    if (dragging) {
        updateSnapCoords(evt.clientX, evt.clientY);
        console.log('snapCoords', snapCoords);

        showPreview(false);
    }
}

function close() {
    if (div) {
        y = x = null;
        mask.removeEventListener('mousedown', onMouseDown, false);
        mask.removeEventListener('mousemove', onMouseMove, false);
        mask.removeEventListener('mouseup', onMouseUp, false);
        document.body.removeChild(div);
        div = null;
        gotPreview = false;
    }
}

function injectStylesheet() {
    // Inject the stylesheet if not already
    if (!document.getElementById('the_stylesheet')) {
        var ss = document.createElement('link');
        ss.setAttribute('id', 'the_stylesheet');
        ss.type = 'text/css';
        ss.rel = 'stylesheet';
        ss.href = chrome.extension.getURL('styles/upload.css');
        document.getElementsByTagName('head')[0].appendChild(ss);
    }
}


function beginSnap(snapImgEl) {
    injectStylesheet();

    dragging = false;
    div = null;
    mask = null;
    dimmer = null;
    preview = null;
    snap = null;
    closer = null;
    x = null;
    y = null;
    gotPreview = false;
    snapCoords = null;
    snapCtx = null;
    snapImg = snapImgEl;

    gotPreview = false;
    div = document.createElement('div');
    div.setAttribute('class', 'pinSnapperOverlay');
    document.body.appendChild(div);

    mask = document.createElement('div');
    mask.setAttribute('class', 'mask');
    div.appendChild(mask);

    dimmer = document.createElement('div');
    dimmer.setAttribute('class', 'dimmer');
    div.appendChild(dimmer);

    closer = document.createElement('div');
    closer.setAttribute('class', 'close');
    div.appendChild(closer);

    mask.addEventListener('mousedown', onMouseDown, false);
    mask.addEventListener('mousemove', onMouseMove, false);
    mask.addEventListener('mouseup', onMouseUp, false);

    closer.addEventListener('click', function () {
        close();
    });
}

function onExtensionMessage(request, sender, sendResponse) {
    console.log('message received : action : ' + request.action);
    if ('pinSnap' === request.action) {
        var snapImg = document.createElement('img');
        snapImg.onload = function () {
            beginSnap(snapImg);
        };
        snapImg.setAttribute('src', request.screenshotDataUri);
    }
    sendResponse({
        response: 'all\'o'
    });
}

function initContentScript() {
    chrome.extension.onRequest.addListener(onExtensionMessage);
}

initContentScript();
