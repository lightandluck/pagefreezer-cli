(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
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
    // Initialize the gapi.client object, which the app uses to make API requests.
    // Get API key and client ID from config.json.
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
            updateSigninStatus(false);
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
function updateSigninStatus(isSignedIn) {
    var user = exports.GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(exports.SCOPE);
    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sign out');
        var profile = user.getBasicProfile();
        $('#auth-status').html("Welcome, " + profile.getName());
    }
    else {
        $('#sign-in-or-out-button').html('Sign In');
        $('#auth-status').html('');
    }
}

},{}],2:[function(require,module,exports){
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
$(document).ready(function () {
    console.log("ready");
    // TODO: determine if old function calls are needed
    // toggleProgressbar(false);
    // $('#toggle_view').click(toggleView);
    // setPagination()
});
// function setPagination() {
//     var urlParams = new URLSearchParams(window.location.search);
//     var index = parseInt(urlParams.get('index')) || 7;
//     $('#prev_index').text(`<-- Row ${index-1}`).attr('href', `/diffbyindex?index=${index-1}`);
//     $('#next_index').text(`Row ${index+1} -->`).attr('href', `/diffbyindex?index=${index+1}`);
// }
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
        }
        else {
            $('#diff_title').text('No data found');
        }
    }, function (response) {
        console.error('Error: ' + response.result.error.message);
    });
}
function loadIframe(html_embed) {
    // inject html
    var iframe = document.getElementById('diff_view');
    iframe.setAttribute('srcdoc', html_embed);
    iframe.onload = function () {
        // inject diff.css to highlight <ins> and <del> elements
        var frm = frames['diff_view'].contentDocument;
        var otherhead = frm.getElementsByTagName("head")[0];
        var link = frm.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", window.location.origin + "/css/diff.css");
        otherhead.appendChild(link);
        // set iframe height = frame content
        iframe.setAttribute('height', iframe.contentWindow.document.body.scrollHeight);
    };
}

},{}]},{},[2,1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtc2hlZXRzLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSx1RUFBdUU7QUFFbkUsUUFBQSxLQUFLLEdBQUcsOENBQThDLENBQUM7QUFFM0QsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNkLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlCLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzdCLFlBQVksRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7QUFFSDtJQUNJLDJDQUEyQztJQUMzQyx1REFBdUQ7SUFDdkQsNkRBQTZEO0lBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRDtJQUNJLHNFQUFzRTtJQUN0RSx3RUFBd0U7SUFDeEUsSUFBSSxZQUFZLEdBQUcsNkRBQTZELENBQUM7SUFFakYsOEVBQThFO0lBQzlFLDhDQUE4QztJQUM5QyxpRUFBaUU7SUFDakUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsVUFBVSxJQUFJO1FBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQ3RCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRS9CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsUUFBUSxFQUFFLE9BQU87WUFDakIsZUFBZSxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQy9CLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLE9BQU8sRUFBRSxhQUFLO1NB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LENBQUM7UUFDcEUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1QixvQ0FBb0M7UUFDcEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBYyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNGLENBQUMsQ0FBQztBQUNOLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gSW5pdGlhbGl6ZXMgR29vZ2xlIEFwaXMgYW5kIGV4cG9ydHMgR29vZ2xlQXV0aCBvYmplY3QgZm9yIHVzIHRvIHVzZS5cbmV4cG9ydCBsZXQgR29vZ2xlQXV0aDogZ2FwaS5hdXRoMi5Hb29nbGVBdXRoLFxuICAgIFNDT1BFID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvc3ByZWFkc2hlZXRzJztcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAgIGhhbmRsZUNsaWVudExvYWQoKTtcbiAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBoYW5kbGVBdXRoQ2xpY2soKTtcbiAgICB9KTtcbiAgICAkKCcjcmV2b2tlLWFjY2Vzcy1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldm9rZUFjY2VzcygpO1xuICAgIH0pO1xufSk7XG5cbmZ1bmN0aW9uIGhhbmRsZUNsaWVudExvYWQoKSB7XG4gICAgLy8gTG9hZCB0aGUgQVBJJ3MgY2xpZW50IGFuZCBhdXRoMiBtb2R1bGVzLlxuICAgIC8vIENhbGwgdGhlIGluaXRDbGllbnQgZnVuY3Rpb24gYWZ0ZXIgdGhlIG1vZHVsZXMgbG9hZC5cbiAgICAvLyBnYXBpIGlzIGEgZ2xvYmFsIHZhcmlhYmxlIGNyZWF0ZWQgYnkgdGhlIGdvb2dsZSBhcGkgc2NyaXB0XG4gICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCBpbml0Q2xpZW50KTtcbn1cblxuZnVuY3Rpb24gaW5pdENsaWVudCgpIHtcbiAgICAvLyBSZXRyaWV2ZSB0aGUgZGlzY292ZXJ5IGRvY3VtZW50IGZvciB2ZXJzaW9uIDQgb2YgR29vZ2xlIFNoZWV0cyBBUEkuXG4gICAgLy8gVGhpcyB3aWxsIHBvcHVsYXRlIG1ldGhvZHMgb24gZ2FwaSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZSBhcGkuXG4gICAgbGV0IGRpc2NvdmVyeVVybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9zaGVldHMvdjQvcmVzdCc7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBnYXBpLmNsaWVudCBvYmplY3QsIHdoaWNoIHRoZSBhcHAgdXNlcyB0byBtYWtlIEFQSSByZXF1ZXN0cy5cbiAgICAvLyBHZXQgQVBJIGtleSBhbmQgY2xpZW50IElEIGZyb20gY29uZmlnLmpzb24uXG4gICAgLy8gJ3Njb3BlJyBmaWVsZCBzcGVjaWZpZXMgc3BhY2UtZGVsaW1pdGVkIGxpc3Qgb2YgYWNjZXNzIHNjb3Blcy5cbiAgICAkLmdldEpTT04oJy4vY29uZmlnLmpzb24nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBsZXQgQVBJX0tFWSA9IGRhdGEuQVBJX0tFWSxcbiAgICAgICAgICAgIENMSUVOVF9JRCA9IGRhdGEuQ0xJRU5UX0lEO1xuICAgICAgICBcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XG4gICAgICAgICAgICAnYXBpS2V5JzogQVBJX0tFWSxcbiAgICAgICAgICAgICdkaXNjb3ZlcnlEb2NzJzogW2Rpc2NvdmVyeVVybF0sXG4gICAgICAgICAgICAnY2xpZW50SWQnOiBDTElFTlRfSUQsXG4gICAgICAgICAgICAnc2NvcGUnOiBTQ09QRVxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdvb2dsZUF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIHNpZ24taW4gc3RhdGUgY2hhbmdlcy5cbiAgICAgICAgICAgIEdvb2dsZUF1dGguaXNTaWduZWRJbi5saXN0ZW4odXBkYXRlU2lnbmluU3RhdHVzKTtcblxuICAgICAgICAgICAgLy8gSGFuZGxlIGluaXRpYWwgc2lnbi1pbiBzdGF0ZS4gKERldGVybWluZSBpZiB1c2VyIGlzIGFscmVhZHkgc2lnbmVkIGluLilcbiAgICAgICAgICAgIHVwZGF0ZVNpZ25pblN0YXR1cyhmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLmZhaWwoKCkgPT4gY29uc29sZS5sb2coJ0NvdWxkIG5vdCBsb2FkIGNvbmZpZy5qc29uJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKCkge1xuICAgIGlmIChHb29nbGVBdXRoLmlzU2lnbmVkSW4uZ2V0KCkpIHtcbiAgICAgICAgLy8gVXNlciBpcyBhdXRob3JpemVkIGFuZCBoYXMgY2xpY2tlZCAnU2lnbiBvdXQnIGJ1dHRvbi5cbiAgICAgICAgR29vZ2xlQXV0aC5zaWduT3V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVXNlciBpcyBub3Qgc2lnbmVkIGluLiBTdGFydCBHb29nbGUgYXV0aCBmbG93LlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25JbigpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldm9rZUFjY2VzcygpIHtcbiAgICBHb29nbGVBdXRoLmRpc2Nvbm5lY3QoKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU2lnbmluU3RhdHVzKGlzU2lnbmVkSW46IGJvb2xlYW4pIHtcbiAgICBsZXQgdXNlciA9IEdvb2dsZUF1dGguY3VycmVudFVzZXIuZ2V0KCk7XG4gICAgbGV0IGlzQXV0aG9yaXplZCA9IHVzZXIuaGFzR3JhbnRlZFNjb3BlcyhTQ09QRSk7XG4gICAgaWYgKGlzQXV0aG9yaXplZCkge1xuICAgICAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuaHRtbCgnU2lnbiBvdXQnKTtcbiAgICAgICAgbGV0IHByb2ZpbGUgPSB1c2VyLmdldEJhc2ljUHJvZmlsZSgpO1xuICAgICAgICAkKCcjYXV0aC1zdGF0dXMnKS5odG1sKGBXZWxjb21lLCAke3Byb2ZpbGUuZ2V0TmFtZSgpfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5odG1sKCdTaWduIEluJyk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoJycpO1xuICAgIH1cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDE3IEFsbGFuIFBpY2hhcmRvLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxuLy9UT0RPOiBpbXBvcnQgZ2FwaSBhbmQgdGVzdCBnb29nbGVhdXRoXG5pbXBvcnQge0dvb2dsZUF1dGh9IGZyb20gXCIuL2dvb2dsZS1zaGVldHNcIjtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJyZWFkeVwiKTtcblxuICAgIC8vIFRPRE86IGRldGVybWluZSBpZiBvbGQgZnVuY3Rpb24gY2FsbHMgYXJlIG5lZWRlZFxuICAgIC8vIHRvZ2dsZVByb2dyZXNzYmFyKGZhbHNlKTtcbiAgICAvLyAkKCcjdG9nZ2xlX3ZpZXcnKS5jbGljayh0b2dnbGVWaWV3KTtcblxuICAgIC8vIHNldFBhZ2luYXRpb24oKVxufSlcblxuLy8gZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcbi8vICAgICB2YXIgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdpbmRleCcpKSB8fCA3O1xuLy8gICAgICQoJyNwcmV2X2luZGV4JykudGV4dChgPC0tIFJvdyAke2luZGV4LTF9YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleC0xfWApO1xuLy8gICAgICQoJyNuZXh0X2luZGV4JykudGV4dChgUm93ICR7aW5kZXgrMX0gLS0+YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleCsxfWApO1xuLy8gfVxuXG5mdW5jdGlvbiBzaG93UGFnZShyb3dfaW5kZXg6IG51bWJlcikge1xuICAgIC8vIGxpbmsgdG8gdGVzdCBzcHJlYWRzaGVldDogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvMTdRQV9DMi1YaExlZnhabFJLdzc0S0RZM1ZOc3RiUHZLM0lIV2x1REpNR1EvZWRpdCNnaWQ9MFxuICAgIHZhciBzaGVldElEID0gJzE3UUFfQzItWGhMZWZ4WmxSS3c3NEtEWTNWTnN0YlB2SzNJSFdsdURKTUdRJ1xuICAgIHZhciByYW5nZSA9IGBBJHtyb3dfaW5kZXh9OkFHJHtyb3dfaW5kZXh9YFxuXG4gICAgLy8gSW5mbyBvbiBzcHJlYWRzaGVldHMudmFsdWVzLmdldDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9yZWZlcmVuY2UvcmVzdC92NC9zcHJlYWRzaGVldHMudmFsdWVzL2dldFxuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG4gICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XG4gICAgICAgICdwYXRoJzogcGF0aCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gd3JpdGUgdG8gc3ByZWFkc2hlZXRzOiBcbiAgICAgICAgLy8gMSkgR2V0IHN0YXJ0ZWQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcXVpY2tzdGFydC9qc1xuICAgICAgICAvLyAyKSBSZWFkL3dyaXRlIGRvY3M6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvZ3VpZGVzL3ZhbHVlc1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSByZXNwb25zZS5yZXN1bHQudmFsdWVzO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcm93X2RhdGEgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB2YXIgb2xkX3VybCA9IHJvd19kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIG5ld191cmwgPSByb3dfZGF0YVs5XTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBzaG91bGQgYmUgcGxhY2VkIGhlcmVcbiAgICAgICAgICAgIC8vIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkSWZyYW1lKGh0bWxfZW1iZWQ6IHN0cmluZykge1xuICAgIC8vIGluamVjdCBodG1sXG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaWZmX3ZpZXcnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzcmNkb2MnLCBodG1sX2VtYmVkKTtcblxuICAgIGlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaW5qZWN0IGRpZmYuY3NzIHRvIGhpZ2hsaWdodCA8aW5zPiBhbmQgPGRlbD4gZWxlbWVudHNcbiAgICAgICAgdmFyIGZybSA9IChmcmFtZXMgYXMgYW55KVsnZGlmZl92aWV3J10uY29udGVudERvY3VtZW50O1xuICAgICAgICB2YXIgb3RoZXJoZWFkID0gZnJtLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcbiAgICAgICAgdmFyIGxpbmsgPSBmcm0uY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwic3R5bGVzaGVldFwiKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9jc3MvZGlmZi5jc3NgKTtcbiAgICAgICAgb3RoZXJoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuXG4gICAgICAgIC8vIHNldCBpZnJhbWUgaGVpZ2h0ID0gZnJhbWUgY29udGVudFxuICAgICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLChpZnJhbWUgYXMgYW55KS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9O1xufVxuIl19
