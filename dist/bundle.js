(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Copyright (c) 2017 Allan Pichardo.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
// Class calls '/diff' route. 
// Work-around until we get ajax request to pf to work on localhost
var Pagefreezer = (function () {
    function Pagefreezer() {
    }
    Pagefreezer.diffPages = function (url1, url2, callback) {
        $.ajax({
            type: "GET",
            url: Pagefreezer.DIFF_API_URL,
            dataType: "json",
            jsonpCallback: callback,
            data: {
                old_url: url1,
                new_url: url2,
                as: "json",
            },
            success: callback,
            error: function (error) {
                console.log(error);
            },
            headers: { "x-api-key": "" }
        });
    };
    return Pagefreezer;
}());
Pagefreezer.DIFF_API_URL = "/diff";
Pagefreezer.API_KEY = "";
exports.Pagefreezer = Pagefreezer;

},{}],2:[function(require,module,exports){
// function initClient() {
//     // Retrieve the discovery document for version 3 of Google Drive API.
//     // In practice, your app can retrieve one or more discovery documents.
//     let discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest';
"use strict";
//     // Initialize the gapi.client object, which app uses to make API requests.
//     // Get API key and client ID from API Console.
//     // 'scope' field specifies space-delimited list of access scopes.
//     gapi.client.init({
//         'apiKey': 'AIzaSyBP2ieKfg0O0kw8nsp9oblQScZOBL-Zp9c',
//         'discoveryDocs': [discoveryUrl],
//         'clientId': '211820258595-4j5qg0orud1dfaoqje5glif74dolg7vk.apps.googleusercontent.com',
//         'scope': SCOPE
//     }).then(function () {
//         GoogleAuth = gapi.auth2.getAuthInstance();
//         // Listen for sign-in state changes.
//         GoogleAuth.isSignedIn.listen(updateSigninStatus);
//         // Handle initial sign-in state. (Determine if user is already signed in.)
//         var user = GoogleAuth.currentUser.get();
//         setSigninStatus(false);
//         // Call handleAuthClick function when user clicks on
//         //      "Sign In/Authorize" button.
//     });
// }
// Initializes Google Apis and exports GoogleAuth object for us to use.
exports.SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
$(document).ready(function () {
    handleClientLoad();
    $('#sign-in-or-out-button').click(function () {
        handleAuthClick();
    });
    $('#revoke-access-button').click(function () {
        revokeAccess();
    });
});
function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    // gapi is a global variable created by the google api script
    gapi.load('client:auth2', initClient);
}
function initClient() {
    // Retrieve the discovery document for version 4 of Google Sheets API.
    // This will populate methods on gapi object so that we can use the api.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest';
    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    $.getJSON('./config.json', function (data) {
        var API_KEY = data.API_KEY, CLIENT_ID = data.CLIENT_ID;
        gapi.client.init({
            'apiKey': API_KEY,
            'discoveryDocs': [discoveryUrl],
            'clientId': CLIENT_ID,
            'scope': exports.SCOPE
        }).then(function () {
            exports.GoogleAuth = gapi.auth2.getAuthInstance();
            // Listen for sign-in state changes.
            exports.GoogleAuth.isSignedIn.listen(updateSigninStatus);
            // Handle initial sign-in state. (Determine if user is already signed in.)
            setSigninStatus(false);
        });
    })
        .fail(function () { return console.log('Could not load config.json'); });
}
function handleAuthClick() {
    if (exports.GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked 'Sign out' button.
        exports.GoogleAuth.signOut();
    }
    else {
        // User is not signed in. Start Google auth flow.
        exports.GoogleAuth.signIn();
    }
}
exports.handleAuthClick = handleAuthClick;
function revokeAccess() {
    exports.GoogleAuth.disconnect();
}
exports.revokeAccess = revokeAccess;
function setSigninStatus(isSignedIn) {
    var user = exports.GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(exports.SCOPE);
    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sign out');
        $('#revoke-access-button').css('display', 'inline-block');
        $('#auth-status').html('You are currently signed in and have granted ' +
            'access to this app.');
    }
    else {
        $('#sign-in-or-out-button').html('Sign In/Authorize');
        $('#revoke-access-button').css('display', 'none');
        $('#auth-status').html('You have not authorized this app or you are ' +
            'signed out.');
    }
}
// entry point for sign-in listener 
// not currently using isSignedIn parameter for anything significant.
// because of Google example. 
// TODO: refactor?
function updateSigninStatus(isSignedIn) {
    setSigninStatus(isSignedIn);
}

},{}],3:[function(require,module,exports){
/*
 * Copyright (c) 2017 Allan Pichardo.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
//TODO: import gapi and test googleauth
var Pagefreezer_1 = require("./Pagefreezer");
$(document).ready(function () {
    console.log("ready");
    toggleProgressbar(false);
    $('#toggle_view').click(toggleView);
    setPagination();
});
function setPagination() {
    var urlParams = new URLSearchParams(window.location.search);
    var index = parseInt(urlParams.get('index')) || 7;
    $('#prev_index').text("<-- Row " + (index - 1)).attr('href', "/diffbyindex?index=" + (index - 1));
    $('#next_index').text("Row " + (index + 1) + " -->").attr('href', "/diffbyindex?index=" + (index + 1));
}
function showPage(row_index) {
    // link to test spreadsheet: https://docs.google.com/spreadsheets/d/17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ/edit#gid=0
    var sheetID = '17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ';
    var range = "A" + row_index + ":AG" + row_index;
    // Info on spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
    var path = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetID + "/values/" + range;
    gapi.client.request({
        'path': path,
    }).then(function (response) {
        // If we need to write to spreadsheets: 
        // 1) Get started: https://developers.google.com/sheets/api/quickstart/js
        // 2) Read/write docs: https://developers.google.com/sheets/api/guides/values
        var values = response.result.values;
        if (values) {
            var row_data = values[0];
            var old_url = row_data[8];
            var new_url = row_data[9];
            console.log(row_data);
            showDiffMetadata(row_data);
        }
        else {
            $('#diff_title').text('No data found');
        }
    }, function (response) {
        console.error('Error: ' + response.result.error.message);
    });
}
function runDiff(old_url, new_url) {
    toggleProgressbar(true);
    Pagefreezer_1.Pagefreezer.diffPages(old_url, new_url, function (data, status) {
        console.log(data);
        loadIframe(data.result.output.html);
        toggleProgressbar(false);
    });
}
function loadIframe(html_embed) {
    // inject html
    var iframe = document.getElementById('pageView');
    iframe.setAttribute('srcdoc', html_embed);
    iframe.onload = function () {
        // inject diff css
        var frm = frames['pageView'].contentDocument;
        var otherhead = frm.getElementsByTagName("head")[0];
        var link = frm.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", window.location.origin + "/css/diff.css");
        otherhead.appendChild(link);
        // set dimensions
        // iframe.setAttribute('width', (iframe as any).contentWindow.document.body.scrollWidth);
        iframe.setAttribute('height', iframe.contentWindow.document.body.scrollHeight);
    };
}
function showDiffMetadata(data) {
    var index = data[0] || 'No index';
    var title = data[5] || 'No title';
    var url = data[6] || 'No url';
    $('#diff_title').text(index + " - " + title + " : ");
    $('#diff_page_url').attr('href', "http://" + url).text(url);
    // Magic numbers! Match with column indexes from google spreadsheet.
    // Hack because we don't get any type of metadata, just an array
    for (var i = 15; i <= 32; i++) {
        $("#cbox" + i).prop('checked', data[i]);
    }
}
function toggleProgressbar(isVisible) {
    if (isVisible) {
        $('.progress').show();
    }
    else {
        $('.progress').hide();
    }
}
function toggleView(e) {
    e.preventDefault();
    $('.info-text').toggle();
    $('#inspectorView').toggleClass('short-view');
}

},{"./Pagefreezer":1}]},{},[3,1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9QYWdlZnJlZXplci50cyIsInNyYy9zY3JpcHRzL2dvb2dsZS1zaGVldHMudHMiLCJzcmMvc2NyaXB0cy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsb0VBQW9FO0FBMkJwRSw4QkFBOEI7QUFDOUIsbUVBQW1FO0FBQ25FO0lBQUE7SUEwQkEsQ0FBQztJQXJCaUIscUJBQVMsR0FBdkIsVUFBd0IsSUFBWSxFQUFFLElBQVksRUFBRSxRQUFpRTtRQUVqSCxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ0gsSUFBSSxFQUFFLEtBQUs7WUFDWCxHQUFHLEVBQUUsV0FBVyxDQUFDLFlBQVk7WUFDN0IsUUFBUSxFQUFFLE1BQU07WUFDaEIsYUFBYSxFQUFFLFFBQVE7WUFDdkIsSUFBSSxFQUFFO2dCQUNGLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxJQUFJO2dCQUNiLEVBQUUsRUFBRSxNQUFNO2FBQ2I7WUFDRCxPQUFPLEVBQUUsUUFBUTtZQUNqQixLQUFLLEVBQUUsVUFBUyxLQUFLO2dCQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7WUFDRCxPQUFPLEVBQUUsRUFBQyxXQUFXLEVBQUUsRUFBRSxFQUFDO1NBQzdCLENBQUMsQ0FBQztJQUVQLENBQUM7SUFFTCxrQkFBQztBQUFELENBMUJBLEFBMEJDO0FBeEJpQix3QkFBWSxHQUFHLE9BQU8sQ0FBQztBQUN2QixtQkFBTyxHQUFHLEVBQUUsQ0FBQztBQUhsQixrQ0FBVzs7O0FDdkN4QiwwQkFBMEI7QUFDMUIsNEVBQTRFO0FBQzVFLDZFQUE2RTtBQUM3RSx3RkFBd0Y7O0FBRXhGLGlGQUFpRjtBQUNqRixxREFBcUQ7QUFDckQsd0VBQXdFO0FBQ3hFLHlCQUF5QjtBQUN6QiwrREFBK0Q7QUFDL0QsMkNBQTJD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QUFTLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFBO0lBQ3pCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUN6QixDQUFDO0FBQ0wsQ0FBQztBQUVELG9CQUFvQixDQUFRO0lBQ3hCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUNuQixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDekIsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2xELENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAxNyBBbGxhbiBQaWNoYXJkby5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ub2RlX21vZHVsZXMvQHR5cGVzL2pxdWVyeS9pbmRleC5kLnRzXCIgLz5cblxuZXhwb3J0IGludGVyZmFjZSBQYWdlZnJlZXplclJlc3BvbnNlIHtcbiAgICBzdGF0dXM6IHN0cmluZztcbiAgICByZXN1bHQ6IFJlc3VsdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXN1bHQge1xuICAgIHN0YXR1czogc3RyaW5nO1xuICAgIG91dHB1dDogT3V0cHV0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE91dHB1dCB7XG4gICAgaHRtbDogc3RyaW5nO1xuICAgIGRpZmZzOiBEaWZmO1xuICAgIHJhd0h0bWwyOiBzdHJpbmc7XG4gICAgcmF3SHRtbDE6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaWZmIHtcblxuICAgIG5ldzogc3RyaW5nO1xuICAgIG9sZDogc3RyaW5nO1xuICAgIGNoYW5nZTogbnVtYmVyO1xuICAgIG9mZnNldDogbnVtYmVyO1xufVxuXG4vLyBDbGFzcyBjYWxscyAnL2RpZmYnIHJvdXRlLiBcbi8vIFdvcmstYXJvdW5kIHVudGlsIHdlIGdldCBhamF4IHJlcXVlc3QgdG8gcGYgdG8gd29yayBvbiBsb2NhbGhvc3RcbmV4cG9ydCBjbGFzcyBQYWdlZnJlZXplciB7XG5cbiAgICBwdWJsaWMgc3RhdGljIERJRkZfQVBJX1VSTCA9IFwiL2RpZmZcIjtcbiAgICBwdWJsaWMgc3RhdGljIEFQSV9LRVkgPSBcIlwiO1xuXG4gICAgcHVibGljIHN0YXRpYyBkaWZmUGFnZXModXJsMTogc3RyaW5nLCB1cmwyOiBzdHJpbmcsIGNhbGxiYWNrOiAocmVzcG9uc2U6IFBhZ2VmcmVlemVyUmVzcG9uc2UsIHN0YXR1czogc3RyaW5nKSA9PiB2b2lkKSB7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICB1cmw6IFBhZ2VmcmVlemVyLkRJRkZfQVBJX1VSTCxcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIGpzb25wQ2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG9sZF91cmw6IHVybDEsXG4gICAgICAgICAgICAgICAgbmV3X3VybDogdXJsMixcbiAgICAgICAgICAgICAgICBhczogXCJqc29uXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogY2FsbGJhY2ssXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGVhZGVyczoge1wieC1hcGkta2V5XCI6IFwiXCJ9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG59IiwiLy8gZnVuY3Rpb24gaW5pdENsaWVudCgpIHtcbi8vICAgICAvLyBSZXRyaWV2ZSB0aGUgZGlzY292ZXJ5IGRvY3VtZW50IGZvciB2ZXJzaW9uIDMgb2YgR29vZ2xlIERyaXZlIEFQSS5cbi8vICAgICAvLyBJbiBwcmFjdGljZSwgeW91ciBhcHAgY2FuIHJldHJpZXZlIG9uZSBvciBtb3JlIGRpc2NvdmVyeSBkb2N1bWVudHMuXG4vLyAgICAgbGV0IGRpc2NvdmVyeVVybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9zaGVldHMvdjQvcmVzdCc7XG5cbi8vICAgICAvLyBJbml0aWFsaXplIHRoZSBnYXBpLmNsaWVudCBvYmplY3QsIHdoaWNoIGFwcCB1c2VzIHRvIG1ha2UgQVBJIHJlcXVlc3RzLlxuLy8gICAgIC8vIEdldCBBUEkga2V5IGFuZCBjbGllbnQgSUQgZnJvbSBBUEkgQ29uc29sZS5cbi8vICAgICAvLyAnc2NvcGUnIGZpZWxkIHNwZWNpZmllcyBzcGFjZS1kZWxpbWl0ZWQgbGlzdCBvZiBhY2Nlc3Mgc2NvcGVzLlxuLy8gICAgIGdhcGkuY2xpZW50LmluaXQoe1xuLy8gICAgICAgICAnYXBpS2V5JzogJ0FJemFTeUJQMmllS2ZnME8wa3c4bnNwOW9ibFFTY1pPQkwtWnA5YycsXG4vLyAgICAgICAgICdkaXNjb3ZlcnlEb2NzJzogW2Rpc2NvdmVyeVVybF0sXG4vLyAgICAgICAgICdjbGllbnRJZCc6ICcyMTE4MjAyNTg1OTUtNGo1cWcwb3J1ZDFkZmFvcWplNWdsaWY3NGRvbGc3dmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxuLy8gICAgICAgICAnc2NvcGUnOiBTQ09QRVxuLy8gICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICBHb29nbGVBdXRoID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKTtcblxuLy8gICAgICAgICAvLyBMaXN0ZW4gZm9yIHNpZ24taW4gc3RhdGUgY2hhbmdlcy5cbi8vICAgICAgICAgR29vZ2xlQXV0aC5pc1NpZ25lZEluLmxpc3Rlbih1cGRhdGVTaWduaW5TdGF0dXMpO1xuXG4vLyAgICAgICAgIC8vIEhhbmRsZSBpbml0aWFsIHNpZ24taW4gc3RhdGUuIChEZXRlcm1pbmUgaWYgdXNlciBpcyBhbHJlYWR5IHNpZ25lZCBpbi4pXG4vLyAgICAgICAgIHZhciB1c2VyID0gR29vZ2xlQXV0aC5jdXJyZW50VXNlci5nZXQoKTtcbi8vICAgICAgICAgc2V0U2lnbmluU3RhdHVzKGZhbHNlKTtcblxuLy8gICAgICAgICAvLyBDYWxsIGhhbmRsZUF1dGhDbGljayBmdW5jdGlvbiB3aGVuIHVzZXIgY2xpY2tzIG9uXG4vLyAgICAgICAgIC8vICAgICAgXCJTaWduIEluL0F1dGhvcml6ZVwiIGJ1dHRvbi5cbiAgICAgICAgXG4vLyAgICAgfSk7XG4vLyB9XG5cbi8vIEluaXRpYWxpemVzIEdvb2dsZSBBcGlzIGFuZCBleHBvcnRzIEdvb2dsZUF1dGggb2JqZWN0IGZvciB1cyB0byB1c2UuXG5leHBvcnQgbGV0IEdvb2dsZUF1dGg6IGdhcGkuYXV0aDIuR29vZ2xlQXV0aCxcbiAgICBTQ09QRSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3NwcmVhZHNoZWV0cyc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBoYW5kbGVDbGllbnRMb2FkKCk7XG4gICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaGFuZGxlQXV0aENsaWNrKCk7XG4gICAgfSk7XG4gICAgJCgnI3Jldm9rZS1hY2Nlc3MtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICByZXZva2VBY2Nlc3MoKTtcbiAgICB9KTtcbn0pO1xuXG5mdW5jdGlvbiBoYW5kbGVDbGllbnRMb2FkKCkge1xuICAgIC8vIExvYWQgdGhlIEFQSSdzIGNsaWVudCBhbmQgYXV0aDIgbW9kdWxlcy5cbiAgICAvLyBDYWxsIHRoZSBpbml0Q2xpZW50IGZ1bmN0aW9uIGFmdGVyIHRoZSBtb2R1bGVzIGxvYWQuXG4gICAgLy8gZ2FwaSBpcyBhIGdsb2JhbCB2YXJpYWJsZSBjcmVhdGVkIGJ5IHRoZSBnb29nbGUgYXBpIHNjcmlwdFxuICAgIGdhcGkubG9hZCgnY2xpZW50OmF1dGgyJywgaW5pdENsaWVudCk7XG59XG5cbmZ1bmN0aW9uIGluaXRDbGllbnQoKSB7XG4gICAgLy8gUmV0cmlldmUgdGhlIGRpc2NvdmVyeSBkb2N1bWVudCBmb3IgdmVyc2lvbiA0IG9mIEdvb2dsZSBTaGVldHMgQVBJLlxuICAgIC8vIFRoaXMgd2lsbCBwb3B1bGF0ZSBtZXRob2RzIG9uIGdhcGkgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIHVzZSB0aGUgYXBpLlxuICAgIGxldCBkaXNjb3ZlcnlVcmwgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZGlzY292ZXJ5L3YxL2FwaXMvc2hlZXRzL3Y0L3Jlc3QnO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgZ2FwaS5jbGllbnQgb2JqZWN0LCB3aGljaCBhcHAgdXNlcyB0byBtYWtlIEFQSSByZXF1ZXN0cy5cbiAgICAvLyBHZXQgQVBJIGtleSBhbmQgY2xpZW50IElEIGZyb20gQVBJIENvbnNvbGUuXG4gICAgLy8gJ3Njb3BlJyBmaWVsZCBzcGVjaWZpZXMgc3BhY2UtZGVsaW1pdGVkIGxpc3Qgb2YgYWNjZXNzIHNjb3Blcy5cbiAgICAkLmdldEpTT04oJy4vY29uZmlnLmpzb24nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBsZXQgQVBJX0tFWSA9IGRhdGEuQVBJX0tFWSxcbiAgICAgICAgICAgIENMSUVOVF9JRCA9IGRhdGEuQ0xJRU5UX0lEO1xuICAgICAgICBcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XG4gICAgICAgICAgICAnYXBpS2V5JzogQVBJX0tFWSxcbiAgICAgICAgICAgICdkaXNjb3ZlcnlEb2NzJzogW2Rpc2NvdmVyeVVybF0sXG4gICAgICAgICAgICAnY2xpZW50SWQnOiBDTElFTlRfSUQsXG4gICAgICAgICAgICAnc2NvcGUnOiBTQ09QRVxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdvb2dsZUF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIHNpZ24taW4gc3RhdGUgY2hhbmdlcy5cbiAgICAgICAgICAgIEdvb2dsZUF1dGguaXNTaWduZWRJbi5saXN0ZW4odXBkYXRlU2lnbmluU3RhdHVzKTtcblxuICAgICAgICAgICAgLy8gSGFuZGxlIGluaXRpYWwgc2lnbi1pbiBzdGF0ZS4gKERldGVybWluZSBpZiB1c2VyIGlzIGFscmVhZHkgc2lnbmVkIGluLilcbiAgICAgICAgICAgIHNldFNpZ25pblN0YXR1cyhmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLmZhaWwoKCkgPT4gY29uc29sZS5sb2coJ0NvdWxkIG5vdCBsb2FkIGNvbmZpZy5qc29uJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKCkge1xuICAgIGlmIChHb29nbGVBdXRoLmlzU2lnbmVkSW4uZ2V0KCkpIHtcbiAgICAgICAgLy8gVXNlciBpcyBhdXRob3JpemVkIGFuZCBoYXMgY2xpY2tlZCAnU2lnbiBvdXQnIGJ1dHRvbi5cbiAgICAgICAgR29vZ2xlQXV0aC5zaWduT3V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVXNlciBpcyBub3Qgc2lnbmVkIGluLiBTdGFydCBHb29nbGUgYXV0aCBmbG93LlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25JbigpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldm9rZUFjY2VzcygpIHtcbiAgICBHb29nbGVBdXRoLmRpc2Nvbm5lY3QoKTtcbn1cblxuZnVuY3Rpb24gc2V0U2lnbmluU3RhdHVzKGlzU2lnbmVkSW46IGJvb2xlYW4pIHtcbiAgICB2YXIgdXNlciA9IEdvb2dsZUF1dGguY3VycmVudFVzZXIuZ2V0KCk7XG4gICAgdmFyIGlzQXV0aG9yaXplZCA9IHVzZXIuaGFzR3JhbnRlZFNjb3BlcyhTQ09QRSk7XG4gICAgaWYgKGlzQXV0aG9yaXplZCkge1xuICAgICAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuaHRtbCgnU2lnbiBvdXQnKTtcbiAgICAgICAgJCgnI3Jldm9rZS1hY2Nlc3MtYnV0dG9uJykuY3NzKCdkaXNwbGF5JywgJ2lubGluZS1ibG9jaycpO1xuICAgICAgICAkKCcjYXV0aC1zdGF0dXMnKS5odG1sKCdZb3UgYXJlIGN1cnJlbnRseSBzaWduZWQgaW4gYW5kIGhhdmUgZ3JhbnRlZCAnICtcbiAgICAgICAgICAgICdhY2Nlc3MgdG8gdGhpcyBhcHAuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gSW4vQXV0aG9yaXplJyk7XG4gICAgICAgICQoJyNyZXZva2UtYWNjZXNzLWJ1dHRvbicpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoJ1lvdSBoYXZlIG5vdCBhdXRob3JpemVkIHRoaXMgYXBwIG9yIHlvdSBhcmUgJyArXG4gICAgICAgICAgICAnc2lnbmVkIG91dC4nKTtcbiAgICB9XG59XG5cbi8vIGVudHJ5IHBvaW50IGZvciBzaWduLWluIGxpc3RlbmVyIFxuLy8gbm90IGN1cnJlbnRseSB1c2luZyBpc1NpZ25lZEluIHBhcmFtZXRlciBmb3IgYW55dGhpbmcgc2lnbmlmaWNhbnQuXG4vLyBiZWNhdXNlIG9mIEdvb2dsZSBleGFtcGxlLiBcbi8vIFRPRE86IHJlZmFjdG9yP1xuZnVuY3Rpb24gdXBkYXRlU2lnbmluU3RhdHVzKGlzU2lnbmVkSW46IGJvb2xlYW4pIHtcbiAgICBzZXRTaWduaW5TdGF0dXMoaXNTaWduZWRJbik7XG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAxNyBBbGxhbiBQaWNoYXJkby5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbi8vVE9ETzogaW1wb3J0IGdhcGkgYW5kIHRlc3QgZ29vZ2xlYXV0aFxuXG5pbXBvcnQge1BhZ2VmcmVlemVyfSBmcm9tIFwiLi9QYWdlZnJlZXplclwiO1xuaW1wb3J0IHtHb29nbGVBdXRofSBmcm9tIFwiLi9nb29nbGUtc2hlZXRzXCI7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwicmVhZHlcIik7XG4gICAgdG9nZ2xlUHJvZ3Jlc3NiYXIoZmFsc2UpO1xuXG4gICAgJCgnI3RvZ2dsZV92aWV3JykuY2xpY2sodG9nZ2xlVmlldyk7XG5cbiAgICBzZXRQYWdpbmF0aW9uKClcbn0pXG5cbmZ1bmN0aW9uIHNldFBhZ2luYXRpb24oKSB7XG4gICAgdmFyIHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgdmFyIGluZGV4ID0gcGFyc2VJbnQodXJsUGFyYW1zLmdldCgnaW5kZXgnKSkgfHwgNztcbiAgICAkKCcjcHJldl9pbmRleCcpLnRleHQoYDwtLSBSb3cgJHtpbmRleC0xfWApLmF0dHIoJ2hyZWYnLCBgL2RpZmZieWluZGV4P2luZGV4PSR7aW5kZXgtMX1gKTtcbiAgICAkKCcjbmV4dF9pbmRleCcpLnRleHQoYFJvdyAke2luZGV4KzF9IC0tPmApLmF0dHIoJ2hyZWYnLCBgL2RpZmZieWluZGV4P2luZGV4PSR7aW5kZXgrMX1gKTtcbn1cblxuZnVuY3Rpb24gc2hvd1BhZ2Uocm93X2luZGV4OiBudW1iZXIpIHtcbiAgICAvLyBsaW5rIHRvIHRlc3Qgc3ByZWFkc2hlZXQ6IGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL3NwcmVhZHNoZWV0cy9kLzE3UUFfQzItWGhMZWZ4WmxSS3c3NEtEWTNWTnN0YlB2SzNJSFdsdURKTUdRL2VkaXQjZ2lkPTBcbiAgICB2YXIgc2hlZXRJRCA9ICcxN1FBX0MyLVhoTGVmeFpsUkt3NzRLRFkzVk5zdGJQdkszSUhXbHVESk1HUSdcbiAgICB2YXIgcmFuZ2UgPSBgQSR7cm93X2luZGV4fTpBRyR7cm93X2luZGV4fWBcblxuICAgIC8vIEluZm8gb24gc3ByZWFkc2hlZXRzLnZhbHVlcy5nZXQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcmVmZXJlbmNlL3Jlc3QvdjQvc3ByZWFkc2hlZXRzLnZhbHVlcy9nZXRcbiAgICB2YXIgcGF0aCA9IGBodHRwczovL3NoZWV0cy5nb29nbGVhcGlzLmNvbS92NC9zcHJlYWRzaGVldHMvJHtzaGVldElEfS92YWx1ZXMvJHtyYW5nZX1gO1xuICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xuICAgICAgICAncGF0aCc6IHBhdGgsXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xuICAgICAgICAvLyBJZiB3ZSBuZWVkIHRvIHdyaXRlIHRvIHNwcmVhZHNoZWV0czogXG4gICAgICAgIC8vIDEpIEdldCBzdGFydGVkOiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9zaGVldHMvYXBpL3F1aWNrc3RhcnQvanNcbiAgICAgICAgLy8gMikgUmVhZC93cml0ZSBkb2NzOiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9zaGVldHMvYXBpL2d1aWRlcy92YWx1ZXNcblxuICAgICAgICB2YXIgdmFsdWVzID0gcmVzcG9uc2UucmVzdWx0LnZhbHVlcztcbiAgICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHJvd19kYXRhID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgdmFyIG9sZF91cmwgPSByb3dfZGF0YVs4XTtcbiAgICAgICAgICAgIHZhciBuZXdfdXJsID0gcm93X2RhdGFbOV07XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJvd19kYXRhKTtcbiAgICAgICAgICAgIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBydW5EaWZmKG9sZF91cmw6IHN0cmluZywgbmV3X3VybDogc3RyaW5nKSB7XG4gICAgdG9nZ2xlUHJvZ3Jlc3NiYXIodHJ1ZSk7XG4gICAgUGFnZWZyZWV6ZXIuZGlmZlBhZ2VzKFxuICAgICAgICBvbGRfdXJsLFxuICAgICAgICBuZXdfdXJsLFxuICAgICAgICBmdW5jdGlvbihkYXRhLCBzdGF0dXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICBsb2FkSWZyYW1lKGRhdGEucmVzdWx0Lm91dHB1dC5odG1sKTtcbiAgICAgICAgICAgIHRvZ2dsZVByb2dyZXNzYmFyKGZhbHNlKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGxvYWRJZnJhbWUoaHRtbF9lbWJlZDogc3RyaW5nKSB7XG4gICAgLy8gaW5qZWN0IGh0bWxcbiAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VWaWV3Jyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjZG9jJywgaHRtbF9lbWJlZCk7XG5cbiAgICBpZnJhbWUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGluamVjdCBkaWZmIGNzc1xuICAgICAgICB2YXIgZnJtID0gKGZyYW1lcyBhcyBhbnkpWydwYWdlVmlldyddLmNvbnRlbnREb2N1bWVudDtcbiAgICAgICAgdmFyIG90aGVyaGVhZCA9IGZybS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07XG4gICAgICAgIHZhciBsaW5rID0gZnJtLmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHQvY3NzXCIpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vY3NzL2RpZmYuY3NzYCk7XG4gICAgICAgIG90aGVyaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcblxuICAgICAgICAvLyBzZXQgZGltZW5zaW9uc1xuICAgICAgICAvLyBpZnJhbWUuc2V0QXR0cmlidXRlKCd3aWR0aCcsIChpZnJhbWUgYXMgYW55KS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsV2lkdGgpO1xuICAgICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLChpZnJhbWUgYXMgYW55KS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzaG93RGlmZk1ldGFkYXRhKGRhdGE6IGFueSkge1xuICAgIHZhciBpbmRleCA9IGRhdGFbMF0gfHwgJ05vIGluZGV4JztcbiAgICB2YXIgdGl0bGUgPSBkYXRhWzVdIHx8ICdObyB0aXRsZSc7XG4gICAgdmFyIHVybCA9IGRhdGFbNl0gfHwgJ05vIHVybCdcbiAgICAkKCcjZGlmZl90aXRsZScpLnRleHQoYCR7aW5kZXh9IC0gJHt0aXRsZX0gOiBgKVxuICAgICQoJyNkaWZmX3BhZ2VfdXJsJykuYXR0cignaHJlZicsIGBodHRwOi8vJHt1cmx9YCkudGV4dCh1cmwpXG5cbiAgICAvLyBNYWdpYyBudW1iZXJzISBNYXRjaCB3aXRoIGNvbHVtbiBpbmRleGVzIGZyb20gZ29vZ2xlIHNwcmVhZHNoZWV0LlxuICAgIC8vIEhhY2sgYmVjYXVzZSB3ZSBkb24ndCBnZXQgYW55IHR5cGUgb2YgbWV0YWRhdGEsIGp1c3QgYW4gYXJyYXlcbiAgICBmb3IgKHZhciBpID0gMTU7IGkgPD0gMzI7IGkrKykge1xuICAgICAgICAkKGAjY2JveCR7aX1gKS5wcm9wKCdjaGVja2VkJywgZGF0YVtpXSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVByb2dyZXNzYmFyKGlzVmlzaWJsZTogYm9vbGVhbikge1xuICAgIGlmKGlzVmlzaWJsZSkge1xuICAgICAgICAkKCcucHJvZ3Jlc3MnKS5zaG93KClcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcucHJvZ3Jlc3MnKS5oaWRlKClcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVZpZXcoZTogRXZlbnQpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmluZm8tdGV4dCcpLnRvZ2dsZSgpO1xuICAgICQoJyNpbnNwZWN0b3JWaWV3JykudG9nZ2xlQ2xhc3MoJ3Nob3J0LXZpZXcnKTtcbn1cblxuLy8gUXVpY2sgdHlwZSBmb3IgVVJMU2VhcmNoUGFyYW1zIFxuZGVjbGFyZSBjbGFzcyBVUkxTZWFyY2hQYXJhbXMge1xuICAgIC8qKiBDb25zdHJ1Y3RvciByZXR1cm5pbmcgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LiAqL1xuICAgIGNvbnN0cnVjdG9yKGluaXQ/OiBzdHJpbmd8IFVSTFNlYXJjaFBhcmFtcyk7XG5cbiAgICAvKiogUmV0dXJucyB0aGUgZmlyc3QgdmFsdWUgYXNzb2NpYXRlZCB0byB0aGUgZ2l2ZW4gc2VhcmNoIHBhcmFtZXRlci4gKi9cbiAgICBnZXQobmFtZTogc3RyaW5nKTogc3RyaW5nO1xufVxuIl19
