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
        $('#auth-status').html('You are currently signed in.');
    }
    else {
        $('#sign-in-or-out-button').html('Sign In');
    }
}
// entry point for sign-in listener 
// not currently using isSignedIn parameter for anything significant.
// because of Google example. 
// TODO: refactor?
function updateSigninStatus(isSignedIn) {
    setSigninStatus(isSignedIn);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtc2hlZXRzLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSx1RUFBdUU7QUFFbkUsUUFBQSxLQUFLLEdBQUcsOENBQThDLENBQUM7QUFFM0QsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNkLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlCLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzdCLFlBQVksRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7QUFFSDtJQUNJLDJDQUEyQztJQUMzQyx1REFBdUQ7SUFDdkQsNkRBQTZEO0lBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRDtJQUNJLHNFQUFzRTtJQUN0RSx3RUFBd0U7SUFDeEUsSUFBSSxZQUFZLEdBQUcsNkRBQTZELENBQUM7SUFFakYsMEVBQTBFO0lBQzFFLDhDQUE4QztJQUM5QyxpRUFBaUU7SUFDakUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsVUFBVSxJQUFJO1FBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQ3RCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRS9CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsUUFBUSxFQUFFLE9BQU87WUFDakIsZUFBZSxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQy9CLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLE9BQU8sRUFBRSxhQUFLO1NB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RSxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTVCLG9DQUFvQztRQUNwQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFjLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDM0YsQ0FBQyxDQUFDO0FBQ04sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBJbml0aWFsaXplcyBHb29nbGUgQXBpcyBhbmQgZXhwb3J0cyBHb29nbGVBdXRoIG9iamVjdCBmb3IgdXMgdG8gdXNlLlxuZXhwb3J0IGxldCBHb29nbGVBdXRoOiBnYXBpLmF1dGgyLkdvb2dsZUF1dGgsXG4gICAgU0NPUEUgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9zcHJlYWRzaGVldHMnO1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgaGFuZGxlQ2xpZW50TG9hZCgpO1xuICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGhhbmRsZUF1dGhDbGljaygpO1xuICAgIH0pO1xuICAgICQoJyNyZXZva2UtYWNjZXNzLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV2b2tlQWNjZXNzKCk7XG4gICAgfSk7XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlQ2xpZW50TG9hZCgpIHtcbiAgICAvLyBMb2FkIHRoZSBBUEkncyBjbGllbnQgYW5kIGF1dGgyIG1vZHVsZXMuXG4gICAgLy8gQ2FsbCB0aGUgaW5pdENsaWVudCBmdW5jdGlvbiBhZnRlciB0aGUgbW9kdWxlcyBsb2FkLlxuICAgIC8vIGdhcGkgaXMgYSBnbG9iYWwgdmFyaWFibGUgY3JlYXRlZCBieSB0aGUgZ29vZ2xlIGFwaSBzY3JpcHRcbiAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsIGluaXRDbGllbnQpO1xufVxuXG5mdW5jdGlvbiBpbml0Q2xpZW50KCkge1xuICAgIC8vIFJldHJpZXZlIHRoZSBkaXNjb3ZlcnkgZG9jdW1lbnQgZm9yIHZlcnNpb24gNCBvZiBHb29nbGUgU2hlZXRzIEFQSS5cbiAgICAvLyBUaGlzIHdpbGwgcG9wdWxhdGUgbWV0aG9kcyBvbiBnYXBpIG9iamVjdCBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIGFwaS5cbiAgICBsZXQgZGlzY292ZXJ5VXJsID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL3NoZWV0cy92NC9yZXN0JztcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGdhcGkuY2xpZW50IG9iamVjdCwgd2hpY2ggYXBwIHVzZXMgdG8gbWFrZSBBUEkgcmVxdWVzdHMuXG4gICAgLy8gR2V0IEFQSSBrZXkgYW5kIGNsaWVudCBJRCBmcm9tIEFQSSBDb25zb2xlLlxuICAgIC8vICdzY29wZScgZmllbGQgc3BlY2lmaWVzIHNwYWNlLWRlbGltaXRlZCBsaXN0IG9mIGFjY2VzcyBzY29wZXMuXG4gICAgJC5nZXRKU09OKCcuL2NvbmZpZy5qc29uJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgbGV0IEFQSV9LRVkgPSBkYXRhLkFQSV9LRVksXG4gICAgICAgICAgICBDTElFTlRfSUQgPSBkYXRhLkNMSUVOVF9JRDtcbiAgICAgICAgXG4gICAgICAgIGdhcGkuY2xpZW50LmluaXQoe1xuICAgICAgICAgICAgJ2FwaUtleSc6IEFQSV9LRVksXG4gICAgICAgICAgICAnZGlzY292ZXJ5RG9jcyc6IFtkaXNjb3ZlcnlVcmxdLFxuICAgICAgICAgICAgJ2NsaWVudElkJzogQ0xJRU5UX0lELFxuICAgICAgICAgICAgJ3Njb3BlJzogU0NPUEVcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBHb29nbGVBdXRoID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBzaWduLWluIHN0YXRlIGNoYW5nZXMuXG4gICAgICAgICAgICBHb29nbGVBdXRoLmlzU2lnbmVkSW4ubGlzdGVuKHVwZGF0ZVNpZ25pblN0YXR1cyk7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBpbml0aWFsIHNpZ24taW4gc3RhdGUuIChEZXRlcm1pbmUgaWYgdXNlciBpcyBhbHJlYWR5IHNpZ25lZCBpbi4pXG4gICAgICAgICAgICBzZXRTaWduaW5TdGF0dXMoZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5mYWlsKCgpID0+IGNvbnNvbGUubG9nKCdDb3VsZCBub3QgbG9hZCBjb25maWcuanNvbicpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUF1dGhDbGljaygpIHtcbiAgICBpZiAoR29vZ2xlQXV0aC5pc1NpZ25lZEluLmdldCgpKSB7XG4gICAgICAgIC8vIFVzZXIgaXMgYXV0aG9yaXplZCBhbmQgaGFzIGNsaWNrZWQgJ1NpZ24gb3V0JyBidXR0b24uXG4gICAgICAgIEdvb2dsZUF1dGguc2lnbk91dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVzZXIgaXMgbm90IHNpZ25lZCBpbi4gU3RhcnQgR29vZ2xlIGF1dGggZmxvdy5cbiAgICAgICAgR29vZ2xlQXV0aC5zaWduSW4oKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZva2VBY2Nlc3MoKSB7XG4gICAgR29vZ2xlQXV0aC5kaXNjb25uZWN0KCk7XG59XG5cbmZ1bmN0aW9uIHNldFNpZ25pblN0YXR1cyhpc1NpZ25lZEluOiBib29sZWFuKSB7XG4gICAgdmFyIHVzZXIgPSBHb29nbGVBdXRoLmN1cnJlbnRVc2VyLmdldCgpO1xuICAgIHZhciBpc0F1dGhvcml6ZWQgPSB1c2VyLmhhc0dyYW50ZWRTY29wZXMoU0NPUEUpO1xuICAgIGlmIChpc0F1dGhvcml6ZWQpIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gb3V0Jyk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoJ1lvdSBhcmUgY3VycmVudGx5IHNpZ25lZCBpbi4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuaHRtbCgnU2lnbiBJbicpO1xuICAgIH1cbn1cblxuLy8gZW50cnkgcG9pbnQgZm9yIHNpZ24taW4gbGlzdGVuZXIgXG4vLyBub3QgY3VycmVudGx5IHVzaW5nIGlzU2lnbmVkSW4gcGFyYW1ldGVyIGZvciBhbnl0aGluZyBzaWduaWZpY2FudC5cbi8vIGJlY2F1c2Ugb2YgR29vZ2xlIGV4YW1wbGUuIFxuLy8gVE9ETzogcmVmYWN0b3I/XG5mdW5jdGlvbiB1cGRhdGVTaWduaW5TdGF0dXMoaXNTaWduZWRJbjogYm9vbGVhbikge1xuICAgIHNldFNpZ25pblN0YXR1cyhpc1NpZ25lZEluKTtcbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDE3IEFsbGFuIFBpY2hhcmRvLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxuLy9UT0RPOiBpbXBvcnQgZ2FwaSBhbmQgdGVzdCBnb29nbGVhdXRoXG5pbXBvcnQge0dvb2dsZUF1dGh9IGZyb20gXCIuL2dvb2dsZS1zaGVldHNcIjtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJyZWFkeVwiKTtcblxuICAgIC8vIFRPRE86IGRldGVybWluZSBpZiBvbGQgZnVuY3Rpb24gY2FsbHMgYXJlIG5lZWRlZFxuICAgIC8vIHRvZ2dsZVByb2dyZXNzYmFyKGZhbHNlKTtcbiAgICAvLyAkKCcjdG9nZ2xlX3ZpZXcnKS5jbGljayh0b2dnbGVWaWV3KTtcblxuICAgIC8vIHNldFBhZ2luYXRpb24oKVxufSlcblxuLy8gZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcbi8vICAgICB2YXIgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdpbmRleCcpKSB8fCA3O1xuLy8gICAgICQoJyNwcmV2X2luZGV4JykudGV4dChgPC0tIFJvdyAke2luZGV4LTF9YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleC0xfWApO1xuLy8gICAgICQoJyNuZXh0X2luZGV4JykudGV4dChgUm93ICR7aW5kZXgrMX0gLS0+YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleCsxfWApO1xuLy8gfVxuXG5mdW5jdGlvbiBzaG93UGFnZShyb3dfaW5kZXg6IG51bWJlcikge1xuICAgIC8vIGxpbmsgdG8gdGVzdCBzcHJlYWRzaGVldDogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvMTdRQV9DMi1YaExlZnhabFJLdzc0S0RZM1ZOc3RiUHZLM0lIV2x1REpNR1EvZWRpdCNnaWQ9MFxuICAgIHZhciBzaGVldElEID0gJzE3UUFfQzItWGhMZWZ4WmxSS3c3NEtEWTNWTnN0YlB2SzNJSFdsdURKTUdRJ1xuICAgIHZhciByYW5nZSA9IGBBJHtyb3dfaW5kZXh9OkFHJHtyb3dfaW5kZXh9YFxuXG4gICAgLy8gSW5mbyBvbiBzcHJlYWRzaGVldHMudmFsdWVzLmdldDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9yZWZlcmVuY2UvcmVzdC92NC9zcHJlYWRzaGVldHMudmFsdWVzL2dldFxuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG4gICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XG4gICAgICAgICdwYXRoJzogcGF0aCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gd3JpdGUgdG8gc3ByZWFkc2hlZXRzOiBcbiAgICAgICAgLy8gMSkgR2V0IHN0YXJ0ZWQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcXVpY2tzdGFydC9qc1xuICAgICAgICAvLyAyKSBSZWFkL3dyaXRlIGRvY3M6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvZ3VpZGVzL3ZhbHVlc1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSByZXNwb25zZS5yZXN1bHQudmFsdWVzO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcm93X2RhdGEgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB2YXIgb2xkX3VybCA9IHJvd19kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIG5ld191cmwgPSByb3dfZGF0YVs5XTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBzaG91bGQgYmUgcGxhY2VkIGhlcmVcbiAgICAgICAgICAgIC8vIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkSWZyYW1lKGh0bWxfZW1iZWQ6IHN0cmluZykge1xuICAgIC8vIGluamVjdCBodG1sXG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaWZmX3ZpZXcnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzcmNkb2MnLCBodG1sX2VtYmVkKTtcblxuICAgIGlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaW5qZWN0IGRpZmYuY3NzIHRvIGhpZ2hsaWdodCA8aW5zPiBhbmQgPGRlbD4gZWxlbWVudHNcbiAgICAgICAgdmFyIGZybSA9IChmcmFtZXMgYXMgYW55KVsnZGlmZl92aWV3J10uY29udGVudERvY3VtZW50O1xuICAgICAgICB2YXIgb3RoZXJoZWFkID0gZnJtLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcbiAgICAgICAgdmFyIGxpbmsgPSBmcm0uY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwic3R5bGVzaGVldFwiKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9jc3MvZGlmZi5jc3NgKTtcbiAgICAgICAgb3RoZXJoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuXG4gICAgICAgIC8vIHNldCBpZnJhbWUgaGVpZ2h0ID0gZnJhbWUgY29udGVudFxuICAgICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLChpZnJhbWUgYXMgYW55KS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9O1xufVxuIl19
