(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
// Initializes Google Apis and exports GoogleAuth object for us to use.
exports.SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
$(document).ready(function () {
    handleClientLoad();
    $('#sign-in-or-out-button').click(function () {
        handleAuthClick();
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
$(document).ready(function () {
    $('#settings').click(handleSettings);
    $('#lnk_add_important_change').click(handleAddImportantChange);
    $('#lnk_add_dictionary').click(handleAddDictionary);
});
function handleSettings() {
    return $.get('settings.html', function (data) {
        bootbox.dialog({
            title: 'Settings',
            message: data,
            buttons: {
                "Save": {
                    className: 'btn-success',
                    callback: savePaths
                },
                "Cancel": {
                    className: 'btn-default'
                }
            }
        });
        getPaths();
    });
}
function handleAddImportantChange(e) {
    console.log(e);
    var spreadsheetId = localStorage.getItem('important_changes_spreadsheetId');
    var url = encodeURI("https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/A10:append?valueInputOption=USER_ENTERED");
    var values = {
        "values": [
            ["test", "hello", "world"]
        ]
    };
    makeRequest('POST', url, JSON.stringify(values), function (err) {
        if (err)
            return console.log(err);
        alert('Change exported.');
    });
}
function handleAddDictionary() {
    var spreadsheetId = localStorage.getItem('dictionary_spreadsheetId');
    var url = encodeURI("https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/A10:append?valueInputOption=USER_ENTERED");
    var values = {
        "values": [
            ["test", "hello", "world"]
        ]
    };
    makeRequest('POST', url, JSON.stringify(values), function (err) {
        if (err)
            return console.log(err);
        alert('Dictionary exported.');
    });
}
function savePaths() {
    var analyst_sheet_path = $('#analyst_sheet_path').val();
    var important_changes_path = $('#important_changes_path').val();
    var dictionary_path = $('#dictionary_path').val();
    var analyst_spreadsheetId = getSpreadsheetId(analyst_sheet_path);
    var changes_spreadsheetId = getSpreadsheetId(important_changes_path);
    var dictionary_spreadsheetId = getSpreadsheetId(dictionary_path);
    var analyst_worksheetId = getWorksheetId(analyst_sheet_path);
    var changes_worksheetId = getWorksheetId(important_changes_path);
    var dictionary_worksheetId = getWorksheetId(dictionary_path);
    localStorage.setItem('analyst_sheet_path', analyst_sheet_path);
    localStorage.setItem('important_changes_path', important_changes_path);
    localStorage.setItem('dictionary_path', dictionary_path);
    localStorage.setItem('analyst_spreadsheetId', analyst_spreadsheetId);
    localStorage.setItem('important_changes_spreadsheetId', changes_spreadsheetId);
    localStorage.setItem('dictionary_spreadsheetId', dictionary_spreadsheetId);
    localStorage.setItem('analyst_worksheetId', analyst_worksheetId);
    localStorage.setItem('important_changes_worksheetId', changes_worksheetId);
    localStorage.setItem('dictionary_worksheetId', dictionary_worksheetId);
}
function getPaths() {
    var analyst_sheet_path = localStorage.getItem('analyst_sheet_path');
    var important_changes_path = localStorage.getItem('important_changes_path');
    var dictionary_path = localStorage.getItem('dictionary_path');
    $('#analyst_sheet_path').val(analyst_sheet_path);
    $('#anaylst_sheet_url').attr('href', analyst_sheet_path);
    $('#important_changes_path').val(important_changes_path);
    $('#important_changes_url').attr('href', important_changes_path);
    $('#dictionary_path').val(dictionary_path);
    $('#dictionary_url').attr('href', dictionary_path);
}
function getSpreadsheetId(url) {
    var re = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)");
    var matches = url.match(re);
    return (matches) ? matches[1] : '';
}
function getWorksheetId(url) {
    var re = new RegExp("[#&]gid=([0-9]+)");
    var matches = url.match(re);
    return (matches) ? matches[1] : '';
}
//TODO: maybe - install npm lib for gapi and use that instead
function makeRequest(method, url, data, callback) {
    var auth = gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
        return callback(new Error('Signin required.'));
    }
    var accessToken = auth.currentUser.get().getAuthResponse().access_token;
    $.ajax(url, {
        method: method,
        data: data,
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        success: function (response) {
            return callback(null, response);
        },
        error: function (response) {
            return callback(new Error(response.responseJSON.message));
        }
    });
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
$(document).ready(function () {
    console.log('ready');
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
        var otherhead = frm.getElementsByTagName('head')[0];
        var link = frm.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', window.location.origin + "/css/diff.css");
        otherhead.appendChild(link);
        // set iframe height = frame content
        iframe.setAttribute('height', iframe.contentWindow.document.body.scrollHeight);
    };
}

},{}]},{},[3,1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtYXV0aC50cyIsInNyYy9zY3JpcHRzL2dvb2dsZS1zaGVldHMudHMiLCJzcmMvc2NyaXB0cy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLHVFQUF1RTtBQUUzRCxRQUFBLEtBQUssR0FBRyw4Q0FBOEMsQ0FBQztBQUVuRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2QsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQixDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUIsZUFBZSxFQUFFLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0ksMkNBQTJDO0lBQzNDLHVEQUF1RDtJQUN2RCw2REFBNkQ7SUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVEO0lBQ0ksc0VBQXNFO0lBQ3RFLHdFQUF3RTtJQUN4RSxJQUFJLFlBQVksR0FBRyw2REFBNkQsQ0FBQztJQUVqRiw4RUFBOEU7SUFDOUUsOENBQThDO0lBQzlDLGlFQUFpRTtJQUNqRSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxVQUFVLElBQUk7UUFDckMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFDdEIsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDYixRQUFRLEVBQUUsT0FBTztZQUNqQixlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsVUFBVSxFQUFFLFNBQVM7WUFDckIsT0FBTyxFQUFFLGFBQUs7U0FDakIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNKLGtCQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUss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QUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxvQkFBb0IsVUFBa0I7SUFDbEMsY0FBYztJQUNkLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFMUMsTUFBTSxDQUFDLE1BQU0sR0FBRztRQUNaLHdEQUF3RDtRQUN4RCxJQUFJLEdBQUcsR0FBSSxNQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsZUFBZSxDQUFDO1FBQ3ZELElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxrQkFBZSxDQUFDLENBQUM7UUFDcEUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1QixvQ0FBb0M7UUFDcEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBYyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNGLENBQUMsQ0FBQztBQUNOLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gSW5pdGlhbGl6ZXMgR29vZ2xlIEFwaXMgYW5kIGV4cG9ydHMgR29vZ2xlQXV0aCBvYmplY3QgZm9yIHVzIHRvIHVzZS5cbmV4cG9ydCBsZXQgIEdvb2dsZUF1dGg6IGdhcGkuYXV0aDIuR29vZ2xlQXV0aCxcbiAgICAgICAgICAgIFNDT1BFID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvc3ByZWFkc2hlZXRzJztcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAgIGhhbmRsZUNsaWVudExvYWQoKTtcbiAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBoYW5kbGVBdXRoQ2xpY2soKTtcbiAgICB9KTtcbn0pO1xuXG5mdW5jdGlvbiBoYW5kbGVDbGllbnRMb2FkKCkge1xuICAgIC8vIExvYWQgdGhlIEFQSSdzIGNsaWVudCBhbmQgYXV0aDIgbW9kdWxlcy5cbiAgICAvLyBDYWxsIHRoZSBpbml0Q2xpZW50IGZ1bmN0aW9uIGFmdGVyIHRoZSBtb2R1bGVzIGxvYWQuXG4gICAgLy8gZ2FwaSBpcyBhIGdsb2JhbCB2YXJpYWJsZSBjcmVhdGVkIGJ5IHRoZSBnb29nbGUgYXBpIHNjcmlwdFxuICAgIGdhcGkubG9hZCgnY2xpZW50OmF1dGgyJywgaW5pdENsaWVudCk7XG59XG5cbmZ1bmN0aW9uIGluaXRDbGllbnQoKSB7XG4gICAgLy8gUmV0cmlldmUgdGhlIGRpc2NvdmVyeSBkb2N1bWVudCBmb3IgdmVyc2lvbiA0IG9mIEdvb2dsZSBTaGVldHMgQVBJLlxuICAgIC8vIFRoaXMgd2lsbCBwb3B1bGF0ZSBtZXRob2RzIG9uIGdhcGkgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIHVzZSB0aGUgYXBpLlxuICAgIGxldCBkaXNjb3ZlcnlVcmwgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZGlzY292ZXJ5L3YxL2FwaXMvc2hlZXRzL3Y0L3Jlc3QnO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgZ2FwaS5jbGllbnQgb2JqZWN0LCB3aGljaCB0aGUgYXBwIHVzZXMgdG8gbWFrZSBBUEkgcmVxdWVzdHMuXG4gICAgLy8gR2V0IEFQSSBrZXkgYW5kIGNsaWVudCBJRCBmcm9tIGNvbmZpZy5qc29uLlxuICAgIC8vICdzY29wZScgZmllbGQgc3BlY2lmaWVzIHNwYWNlLWRlbGltaXRlZCBsaXN0IG9mIGFjY2VzcyBzY29wZXMuXG4gICAgJC5nZXRKU09OKCcuL2NvbmZpZy5qc29uJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgbGV0IEFQSV9LRVkgPSBkYXRhLkFQSV9LRVksXG4gICAgICAgICAgICBDTElFTlRfSUQgPSBkYXRhLkNMSUVOVF9JRDtcbiAgICAgICAgXG4gICAgICAgIGdhcGkuY2xpZW50LmluaXQoe1xuICAgICAgICAgICAgJ2FwaUtleSc6IEFQSV9LRVksXG4gICAgICAgICAgICAnZGlzY292ZXJ5RG9jcyc6IFtkaXNjb3ZlcnlVcmxdLFxuICAgICAgICAgICAgJ2NsaWVudElkJzogQ0xJRU5UX0lELFxuICAgICAgICAgICAgJ3Njb3BlJzogU0NPUEVcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBHb29nbGVBdXRoID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBzaWduLWluIHN0YXRlIGNoYW5nZXMuXG4gICAgICAgICAgICBHb29nbGVBdXRoLmlzU2lnbmVkSW4ubGlzdGVuKHVwZGF0ZVNpZ25pblN0YXR1cyk7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBpbml0aWFsIHNpZ24taW4gc3RhdGUuIChEZXRlcm1pbmUgaWYgdXNlciBpcyBhbHJlYWR5IHNpZ25lZCBpbi4pXG4gICAgICAgICAgICB1cGRhdGVTaWduaW5TdGF0dXMoZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5mYWlsKCgpID0+IGNvbnNvbGUubG9nKCdDb3VsZCBub3QgbG9hZCBjb25maWcuanNvbicpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUF1dGhDbGljaygpIHtcbiAgICBpZiAoR29vZ2xlQXV0aC5pc1NpZ25lZEluLmdldCgpKSB7XG4gICAgICAgIC8vIFVzZXIgaXMgYXV0aG9yaXplZCBhbmQgaGFzIGNsaWNrZWQgJ1NpZ24gb3V0JyBidXR0b24uXG4gICAgICAgIEdvb2dsZUF1dGguc2lnbk91dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVzZXIgaXMgbm90IHNpZ25lZCBpbi4gU3RhcnQgR29vZ2xlIGF1dGggZmxvdy5cbiAgICAgICAgR29vZ2xlQXV0aC5zaWduSW4oKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZva2VBY2Nlc3MoKSB7XG4gICAgR29vZ2xlQXV0aC5kaXNjb25uZWN0KCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNpZ25pblN0YXR1cyhpc1NpZ25lZEluOiBib29sZWFuKSB7XG4gICAgbGV0IHVzZXIgPSBHb29nbGVBdXRoLmN1cnJlbnRVc2VyLmdldCgpO1xuICAgIGxldCBpc0F1dGhvcml6ZWQgPSB1c2VyLmhhc0dyYW50ZWRTY29wZXMoU0NPUEUpO1xuICAgIGlmIChpc0F1dGhvcml6ZWQpIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gb3V0Jyk7XG4gICAgICAgIGxldCBwcm9maWxlID0gdXNlci5nZXRCYXNpY1Byb2ZpbGUoKTtcbiAgICAgICAgJCgnI2F1dGgtc3RhdHVzJykuaHRtbChgV2VsY29tZSwgJHtwcm9maWxlLmdldE5hbWUoKX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuaHRtbCgnU2lnbiBJbicpO1xuICAgICAgICAkKCcjYXV0aC1zdGF0dXMnKS5odG1sKCcnKTtcbiAgICB9XG59XG5cbiIsIiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICAkKCcjc2V0dGluZ3MnKS5jbGljayhoYW5kbGVTZXR0aW5ncyk7IFxuICAgICQoJyNsbmtfYWRkX2ltcG9ydGFudF9jaGFuZ2UnKS5jbGljayhoYW5kbGVBZGRJbXBvcnRhbnRDaGFuZ2UpO1xuICAgICQoJyNsbmtfYWRkX2RpY3Rpb25hcnknKS5jbGljayhoYW5kbGVBZGREaWN0aW9uYXJ5KTtcbn0pO1xuXG5mdW5jdGlvbiBoYW5kbGVTZXR0aW5ncygpIHtcbiAgICByZXR1cm4gJC5nZXQoJ3NldHRpbmdzLmh0bWwnLCAoZGF0YSkgPT4ge1xuICAgICAgICBib290Ym94LmRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZTogJ1NldHRpbmdzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGRhdGEsXG4gICAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAgICAgXCJTYXZlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYnRuLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogc2F2ZVBhdGhzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIkNhbmNlbFwiOiB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0bi1kZWZhdWx0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGdldFBhdGhzKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUFkZEltcG9ydGFudENoYW5nZShlOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhlKTtcbiAgICBsZXQgc3ByZWFkc2hlZXRJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19zcHJlYWRzaGVldElkJyk7XG4gICAgdmFyIHVybCA9IGVuY29kZVVSSShgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c3ByZWFkc2hlZXRJZH0vdmFsdWVzL0ExMDphcHBlbmQ/dmFsdWVJbnB1dE9wdGlvbj1VU0VSX0VOVEVSRURgKTtcblxuICAgIHZhciB2YWx1ZXMgPSB7XG4gICAgICAgIFwidmFsdWVzXCI6IFtcbiAgICAgICAgICAgICAgICBbXCJ0ZXN0XCIsIFwiaGVsbG9cIiwgXCJ3b3JsZFwiXVxuICAgICAgICAgICAgXVxuICAgICAgICB9XG5cbiAgICBtYWtlUmVxdWVzdCgnUE9TVCcsIHVybCwgSlNPTi5zdHJpbmdpZnkodmFsdWVzKSwgZnVuY3Rpb24oZXJyOiBhbnkpIHtcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGFsZXJ0KCdDaGFuZ2UgZXhwb3J0ZWQuJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUFkZERpY3Rpb25hcnkoKSB7XG4gICAgXG4gICAgbGV0IHNwcmVhZHNoZWV0SWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGljdGlvbmFyeV9zcHJlYWRzaGVldElkJyk7XG4gICAgdmFyIHVybCA9IGVuY29kZVVSSShgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c3ByZWFkc2hlZXRJZH0vdmFsdWVzL0ExMDphcHBlbmQ/dmFsdWVJbnB1dE9wdGlvbj1VU0VSX0VOVEVSRURgKTtcblxuICAgIHZhciB2YWx1ZXMgPSB7XG4gICAgICAgIFwidmFsdWVzXCI6IFtcbiAgICAgICAgICAgICAgICBbXCJ0ZXN0XCIsIFwiaGVsbG9cIiwgXCJ3b3JsZFwiXVxuICAgICAgICAgICAgXVxuICAgICAgICB9XG5cbiAgICBtYWtlUmVxdWVzdCgnUE9TVCcsIHVybCwgSlNPTi5zdHJpbmdpZnkodmFsdWVzKSwgZnVuY3Rpb24oZXJyOiBhbnkpIHtcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGFsZXJ0KCdEaWN0aW9uYXJ5IGV4cG9ydGVkLicpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzYXZlUGF0aHMoKSB7XG4gICAgbGV0IGFuYWx5c3Rfc2hlZXRfcGF0aCA9ICQoJyNhbmFseXN0X3NoZWV0X3BhdGgnKS52YWwoKTtcbiAgICBsZXQgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCA9ICQoJyNpbXBvcnRhbnRfY2hhbmdlc19wYXRoJykudmFsKCk7XG4gICAgbGV0IGRpY3Rpb25hcnlfcGF0aCA9ICQoJyNkaWN0aW9uYXJ5X3BhdGgnKS52YWwoKTtcblxuICAgIGxldCBhbmFseXN0X3NwcmVhZHNoZWV0SWQgPSBnZXRTcHJlYWRzaGVldElkKGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG4gICAgbGV0IGNoYW5nZXNfc3ByZWFkc2hlZXRJZCA9IGdldFNwcmVhZHNoZWV0SWQoaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG4gICAgbGV0IGRpY3Rpb25hcnlfc3ByZWFkc2hlZXRJZCA9IGdldFNwcmVhZHNoZWV0SWQoZGljdGlvbmFyeV9wYXRoKTtcblxuICAgIGxldCBhbmFseXN0X3dvcmtzaGVldElkID0gZ2V0V29ya3NoZWV0SWQoYW5hbHlzdF9zaGVldF9wYXRoKTtcbiAgICBsZXQgY2hhbmdlc193b3Jrc2hlZXRJZCA9IGdldFdvcmtzaGVldElkKGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuICAgIGxldCBkaWN0aW9uYXJ5X3dvcmtzaGVldElkID0gZ2V0V29ya3NoZWV0SWQoZGljdGlvbmFyeV9wYXRoKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhbmFseXN0X3NoZWV0X3BhdGgnLCBhbmFseXN0X3NoZWV0X3BhdGgpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19wYXRoJywgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RpY3Rpb25hcnlfcGF0aCcsIGRpY3Rpb25hcnlfcGF0aCk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYW5hbHlzdF9zcHJlYWRzaGVldElkJywgYW5hbHlzdF9zcHJlYWRzaGVldElkKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfc3ByZWFkc2hlZXRJZCcsIGNoYW5nZXNfc3ByZWFkc2hlZXRJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RpY3Rpb25hcnlfc3ByZWFkc2hlZXRJZCcsIGRpY3Rpb25hcnlfc3ByZWFkc2hlZXRJZCk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYW5hbHlzdF93b3Jrc2hlZXRJZCcsIGFuYWx5c3Rfd29ya3NoZWV0SWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc193b3Jrc2hlZXRJZCcsIGNoYW5nZXNfd29ya3NoZWV0SWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkaWN0aW9uYXJ5X3dvcmtzaGVldElkJywgZGljdGlvbmFyeV93b3Jrc2hlZXRJZCk7XG4gICAgXG59XG5cbmZ1bmN0aW9uIGdldFBhdGhzKCkge1xuICAgIGxldCBhbmFseXN0X3NoZWV0X3BhdGggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYW5hbHlzdF9zaGVldF9wYXRoJyk7XG4gICAgbGV0IGltcG9ydGFudF9jaGFuZ2VzX3BhdGggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpO1xuICAgIGxldCBkaWN0aW9uYXJ5X3BhdGggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGljdGlvbmFyeV9wYXRoJyk7XG5cbiAgICAkKCcjYW5hbHlzdF9zaGVldF9wYXRoJykudmFsKGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG4gICAgJCgnI2FuYXlsc3Rfc2hlZXRfdXJsJykuYXR0cignaHJlZicsIGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG5cbiAgICAkKCcjaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpLnZhbChpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcbiAgICAkKCcjaW1wb3J0YW50X2NoYW5nZXNfdXJsJykuYXR0cignaHJlZicsIGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuXG4gICAgJCgnI2RpY3Rpb25hcnlfcGF0aCcpLnZhbChkaWN0aW9uYXJ5X3BhdGgpO1xuICAgICQoJyNkaWN0aW9uYXJ5X3VybCcpLmF0dHIoJ2hyZWYnLCBkaWN0aW9uYXJ5X3BhdGgpO1xufVxuXG5mdW5jdGlvbiBnZXRTcHJlYWRzaGVldElkKHVybDogc3RyaW5nKSB7XG4gICAgbGV0IHJlID0gbmV3IFJlZ0V4cChcIi9zcHJlYWRzaGVldHMvZC8oW2EtekEtWjAtOS1fXSspXCIpO1xuICAgIGxldCBtYXRjaGVzID0gdXJsLm1hdGNoKHJlKTtcbiAgICByZXR1cm4gKG1hdGNoZXMpID8gbWF0Y2hlc1sxXSA6ICcnO1xufVxuXG5mdW5jdGlvbiBnZXRXb3Jrc2hlZXRJZCh1cmw6IHN0cmluZykge1xuICAgIGxldCByZSA9IG5ldyBSZWdFeHAoXCJbIyZdZ2lkPShbMC05XSspXCIpO1xuICAgIGxldCBtYXRjaGVzID0gdXJsLm1hdGNoKHJlKTtcbiAgICByZXR1cm4gKG1hdGNoZXMpID8gbWF0Y2hlc1sxXSA6ICcnO1xufVxuXG4vL1RPRE86IG1heWJlIC0gaW5zdGFsbCBucG0gbGliIGZvciBnYXBpIGFuZCB1c2UgdGhhdCBpbnN0ZWFkXG5mdW5jdGlvbiBtYWtlUmVxdWVzdChtZXRob2Q6IHN0cmluZywgdXJsOnN0cmluZywgZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gIHZhciBhdXRoID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKTtcbiAgaWYgKCFhdXRoLmlzU2lnbmVkSW4uZ2V0KCkpIHtcbiAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdTaWduaW4gcmVxdWlyZWQuJykpO1xuICB9XG4gIHZhciBhY2Nlc3NUb2tlbiA9IGF1dGguY3VycmVudFVzZXIuZ2V0KCkuZ2V0QXV0aFJlc3BvbnNlKCkuYWNjZXNzX3Rva2VuO1xuICAkLmFqYXgodXJsLCB7XG4gICAgbWV0aG9kOiBtZXRob2QsXG4gICAgZGF0YTogZGF0YSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgYWNjZXNzVG9rZW4sXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihyZXNwb25zZS5yZXNwb25zZUpTT04ubWVzc2FnZSkpO1xuICAgIH1cbiAgfSk7XG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQWxsYW4gUGljaGFyZG8uXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5pbXBvcnQge0dvb2dsZUF1dGh9IGZyb20gJy4vZ29vZ2xlLWF1dGgnO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygncmVhZHknKTtcblxuICAgIC8vIFRPRE86IGRldGVybWluZSBpZiBvbGQgZnVuY3Rpb24gY2FsbHMgYXJlIG5lZWRlZFxuICAgIC8vIHRvZ2dsZVByb2dyZXNzYmFyKGZhbHNlKTtcbiAgICAvLyAkKCcjdG9nZ2xlX3ZpZXcnKS5jbGljayh0b2dnbGVWaWV3KTtcblxuICAgIC8vIHNldFBhZ2luYXRpb24oKVxufSlcblxuLy8gZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcbi8vICAgICB2YXIgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdpbmRleCcpKSB8fCA3O1xuLy8gICAgICQoJyNwcmV2X2luZGV4JykudGV4dChgPC0tIFJvdyAke2luZGV4LTF9YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleC0xfWApO1xuLy8gICAgICQoJyNuZXh0X2luZGV4JykudGV4dChgUm93ICR7aW5kZXgrMX0gLS0+YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleCsxfWApO1xuLy8gfVxuXG5mdW5jdGlvbiBzaG93UGFnZShyb3dfaW5kZXg6IG51bWJlcikge1xuICAgIC8vIGxpbmsgdG8gdGVzdCBzcHJlYWRzaGVldDogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvMTdRQV9DMi1YaExlZnhabFJLdzc0S0RZM1ZOc3RiUHZLM0lIV2x1REpNR1EvZWRpdCNnaWQ9MFxuICAgIHZhciBzaGVldElEID0gJzE3UUFfQzItWGhMZWZ4WmxSS3c3NEtEWTNWTnN0YlB2SzNJSFdsdURKTUdRJ1xuICAgIHZhciByYW5nZSA9IGBBJHtyb3dfaW5kZXh9OkFHJHtyb3dfaW5kZXh9YFxuXG4gICAgLy8gSW5mbyBvbiBzcHJlYWRzaGVldHMudmFsdWVzLmdldDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9yZWZlcmVuY2UvcmVzdC92NC9zcHJlYWRzaGVldHMudmFsdWVzL2dldFxuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG4gICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XG4gICAgICAgICdwYXRoJzogcGF0aCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gd3JpdGUgdG8gc3ByZWFkc2hlZXRzOiBcbiAgICAgICAgLy8gMSkgR2V0IHN0YXJ0ZWQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcXVpY2tzdGFydC9qc1xuICAgICAgICAvLyAyKSBSZWFkL3dyaXRlIGRvY3M6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvZ3VpZGVzL3ZhbHVlc1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSByZXNwb25zZS5yZXN1bHQudmFsdWVzO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcm93X2RhdGEgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB2YXIgb2xkX3VybCA9IHJvd19kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIG5ld191cmwgPSByb3dfZGF0YVs5XTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBzaG91bGQgYmUgcGxhY2VkIGhlcmVcbiAgICAgICAgICAgIC8vIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkSWZyYW1lKGh0bWxfZW1iZWQ6IHN0cmluZykge1xuICAgIC8vIGluamVjdCBodG1sXG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaWZmX3ZpZXcnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzcmNkb2MnLCBodG1sX2VtYmVkKTtcblxuICAgIGlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaW5qZWN0IGRpZmYuY3NzIHRvIGhpZ2hsaWdodCA8aW5zPiBhbmQgPGRlbD4gZWxlbWVudHNcbiAgICAgICAgdmFyIGZybSA9IChmcmFtZXMgYXMgYW55KVsnZGlmZl92aWV3J10uY29udGVudERvY3VtZW50O1xuICAgICAgICB2YXIgb3RoZXJoZWFkID0gZnJtLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgIHZhciBsaW5rID0gZnJtLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdzdHlsZXNoZWV0Jyk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vY3NzL2RpZmYuY3NzYCk7XG4gICAgICAgIG90aGVyaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcblxuICAgICAgICAvLyBzZXQgaWZyYW1lIGhlaWdodCA9IGZyYW1lIGNvbnRlbnRcbiAgICAgICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywoaWZyYW1lIGFzIGFueSkuY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfTtcbn1cbiJdfQ==
