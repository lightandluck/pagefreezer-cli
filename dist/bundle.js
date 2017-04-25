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
    $('#settings').click(function () {
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
    });
    $('#lnk_add_important_change').click(function () {
        var spreadsheetId = '1YK_kRUg8Za7ynTVbD70At39a_osnzhJBI2NfkLSGvtM';
        var range = 'Important Changes';
        var url = encodeURI("https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/" + range + ":append?valueInputOption=USER_ENTERED");
        var values = {
            "values": [
                ["test", "hello", "world"]
            ]
        };
        makeRequest('POST', url, JSON.stringify(values), function (err) {
            if (err)
                return console.log(err);
            console.log('Record exported.');
        });
    });
});
function savePaths() {
    localStorage.setItem('important_changes_path', $('#important_changes_path').val());
    localStorage.setItem('dictionary_path', $('#dictionary_path').val());
    localStorage.setItem('analyst_sheet_path', $('#analyst_sheet_path').val());
}
function getPaths() {
    var changes_url = localStorage.getItem('important_changes_path');
    var dictionary_url = localStorage.getItem('dictionary_path');
    var analyst_url = localStorage.getItem('analyst_sheet_path');
    $('#analyst_sheet_path').val(analyst_url);
    $('#anaylst_sheet_url').attr('href', analyst_url);
    $('#important_changes_path').val(changes_url);
    $('#important_changes_url').attr('href', changes_url);
    $('#dictionary_path').val(dictionary_url);
    $('#dictionary_url').attr('href', dictionary_url);
}
function getSpreadsheetId(url) {
}
function makeRequest(method, url, value, callback) {
    var auth = gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
        return callback(new Error('Signin required.'));
    }
    var accessToken = auth.currentUser.get().getAuthResponse().access_token;
    $.ajax(url, {
        method: method,
        data: value,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtYXV0aC50cyIsInNyYy9zY3JpcHRzL2dvb2dsZS1zaGVldHMudHMiLCJzcmMvc2NyaXB0cy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLHVFQUF1RTtBQUUzRCxRQUFBLEtBQUssR0FBRyw4Q0FBOEMsQ0FBQztBQUVuRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2QsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQixDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUIsZUFBZSxFQUFFLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0ksMkNBQTJDO0lBQzNDLHVEQUF1RDtJQUN2RCw2REFBNkQ7SUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVEO0lBQ0ksc0VBQXNFO0lBQ3RFLHdFQUF3RTtJQUN4RSxJQUFJLFlBQVksR0FBRyw2REFBNkQsQ0FBQztJQUVqRiw4RUFBOEU7SUFDOUUsOENBQThDO0lBQzlDLGlFQUFpRTtJQUNqRSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxVQUFVLElBQUk7UUFDckMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFDdEIsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDYixRQUFRLEVBQUUsT0FBTztZQUNqQixlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsVUFBVSxFQUFFLFNBQVM7WUFDckIsT0FBTyxFQUFFLGFBQUs7U0FDakIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNKLGtCQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUUxQyxvQ0FBb0M7WUFDcEMsa0JBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFakQsMEVBQTBFO1lBQzFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEVBQXpDLENBQXlDLENBQUMsQ0FBQztBQUMzRCxDQUFDO0FBRUQ7SUFDSSxFQUFFLENBQUMsQ0FBQyxrQkFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUIsd0RBQXdEO1FBQ3hELGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osaURBQWlEO1FBQ2pELGtCQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztBQUNMLENBQUM7QUFSRCwwQ0FRQztBQUVEO0lBQ0ksa0JBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRkQsb0NBRUM7QUFFRCw0QkFBNEIsVUFBbUI7SUFDM0MsSUFBSSxJQUFJLEdBQUcsa0JBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDeEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQUssQ0FBQyxDQUFDO0lBQ2hELEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDZixDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBWSxPQUFPLENBQUMsT0FBTyxFQUFJLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO0FBQ0wsQ0FBQzs7O0FDekVELENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDZCxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxVQUFDLElBQUk7WUFDL0IsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDWCxLQUFLLEVBQUUsVUFBVTtnQkFDakIsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFO29CQUNMLE1BQU0sRUFBRTt3QkFDSixTQUFTLEVBQUUsYUFBYTt3QkFDeEIsUUFBUSxFQUFFLFNBQVM7cUJBQ3RCO29CQUNELFFBQVEsRUFBRTt3QkFDTixTQUFTLEVBQUUsYUFBYTtxQkFDM0I7aUJBQ0o7YUFDSixDQUFDLENBQUM7WUFFSCxRQUFRLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDakMsSUFBSSxhQUFhLEdBQUcsOENBQThDLENBQUM7UUFDbkUsSUFBSSxLQUFLLEdBQUcsbUJBQW1CLENBQUM7UUFFaEMsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLG1EQUFpRCxhQUFhLGdCQUFXLEtBQUssMENBQXVDLENBQUMsQ0FBQztRQUUzSSxJQUFJLE1BQU0sR0FBRztZQUNULFFBQVEsRUFBRTtnQkFDRixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO2FBQzdCO1NBQ0osQ0FBQTtRQUVMLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBUyxHQUFRO1lBQzlELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRUg7SUFDSSxZQUFZLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDbkYsWUFBWSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLFlBQVksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQ7SUFDSSxJQUFJLFdBQVcsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDakUsSUFBSSxjQUFjLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzdELElBQUksV0FBVyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUU3RCxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUVsRCxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDOUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUV0RCxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBQ0QsMEJBQTBCLEdBQVc7QUFFckMsQ0FBQztBQUVELHFCQUFxQixNQUFjLEVBQUUsR0FBVSxFQUFFLEtBQVUsRUFBRSxRQUFhO0lBQ3hFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBQ0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFDeEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDVixNQUFNLEVBQUUsTUFBTTtRQUNkLElBQUksRUFBRSxLQUFLO1FBQ1gsUUFBUSxFQUFFLE1BQU07UUFDaEIsT0FBTyxFQUFFO1lBQ1AsZUFBZSxFQUFFLFNBQVMsR0FBRyxXQUFXO1lBQ3hDLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkM7UUFDRCxPQUFPLEVBQUUsVUFBUyxRQUFRO1lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxLQUFLLEVBQUUsVUFBUyxRQUFRO1lBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDOzs7QUNyRkQ7Ozs7Ozs7O0dBUUc7O0FBSUgsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFckIsbURBQW1EO0lBQ25ELDRCQUE0QjtJQUM1Qix1Q0FBdUM7SUFFdkMsa0JBQWtCO0FBQ3RCLENBQUMsQ0FBQyxDQUFBO0FBRUYsNkJBQTZCO0FBQzdCLG1FQUFtRTtBQUNuRSx5REFBeUQ7QUFDekQsaUdBQWlHO0FBQ2pHLGlHQUFpRztBQUNqRyxJQUFJO0FBRUosa0JBQWtCLFNBQWlCO0lBQy9CLDJIQUEySDtJQUMzSCxJQUFJLE9BQU8sR0FBRyw4Q0FBOEMsQ0FBQTtJQUM1RCxJQUFJLEtBQUssR0FBRyxNQUFJLFNBQVMsV0FBTSxTQUFXLENBQUE7SUFFMUMsc0hBQXNIO0lBQ3RILElBQUksSUFBSSxHQUFHLG1EQUFpRCxPQUFPLGdCQUFXLEtBQU8sQ0FBQztJQUN0RixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNoQixNQUFNLEVBQUUsSUFBSTtLQUNmLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFhO1FBQzNCLHdDQUF3QztRQUN4Qyx5RUFBeUU7UUFDekUsNkVBQTZFO1FBRTdFLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDVCxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBSzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDMUMsQ0FBQztJQUNMLENBQUMsRUFBRSxVQUFVLFFBQWE7UUFDdEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsb0JBQW9CLFVBQWtCO0lBQ2xDLGNBQWM7SUFDZCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7UUFDWix3REFBd0Q7UUFDeEQsSUFBSSxHQUFHLEdBQUksTUFBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUN2RCxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBSyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sa0JBQWUsQ0FBQyxDQUFDO1FBQ3BFLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsb0NBQW9DO1FBQ3BDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQWMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRixDQUFDLENBQUM7QUFDTixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEluaXRpYWxpemVzIEdvb2dsZSBBcGlzIGFuZCBleHBvcnRzIEdvb2dsZUF1dGggb2JqZWN0IGZvciB1cyB0byB1c2UuXG5leHBvcnQgbGV0ICBHb29nbGVBdXRoOiBnYXBpLmF1dGgyLkdvb2dsZUF1dGgsXG4gICAgICAgICAgICBTQ09QRSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3NwcmVhZHNoZWV0cyc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBoYW5kbGVDbGllbnRMb2FkKCk7XG4gICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaGFuZGxlQXV0aENsaWNrKCk7XG4gICAgfSk7XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlQ2xpZW50TG9hZCgpIHtcbiAgICAvLyBMb2FkIHRoZSBBUEkncyBjbGllbnQgYW5kIGF1dGgyIG1vZHVsZXMuXG4gICAgLy8gQ2FsbCB0aGUgaW5pdENsaWVudCBmdW5jdGlvbiBhZnRlciB0aGUgbW9kdWxlcyBsb2FkLlxuICAgIC8vIGdhcGkgaXMgYSBnbG9iYWwgdmFyaWFibGUgY3JlYXRlZCBieSB0aGUgZ29vZ2xlIGFwaSBzY3JpcHRcbiAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsIGluaXRDbGllbnQpO1xufVxuXG5mdW5jdGlvbiBpbml0Q2xpZW50KCkge1xuICAgIC8vIFJldHJpZXZlIHRoZSBkaXNjb3ZlcnkgZG9jdW1lbnQgZm9yIHZlcnNpb24gNCBvZiBHb29nbGUgU2hlZXRzIEFQSS5cbiAgICAvLyBUaGlzIHdpbGwgcG9wdWxhdGUgbWV0aG9kcyBvbiBnYXBpIG9iamVjdCBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIGFwaS5cbiAgICBsZXQgZGlzY292ZXJ5VXJsID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL3NoZWV0cy92NC9yZXN0JztcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGdhcGkuY2xpZW50IG9iamVjdCwgd2hpY2ggdGhlIGFwcCB1c2VzIHRvIG1ha2UgQVBJIHJlcXVlc3RzLlxuICAgIC8vIEdldCBBUEkga2V5IGFuZCBjbGllbnQgSUQgZnJvbSBjb25maWcuanNvbi5cbiAgICAvLyAnc2NvcGUnIGZpZWxkIHNwZWNpZmllcyBzcGFjZS1kZWxpbWl0ZWQgbGlzdCBvZiBhY2Nlc3Mgc2NvcGVzLlxuICAgICQuZ2V0SlNPTignLi9jb25maWcuanNvbicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGxldCBBUElfS0VZID0gZGF0YS5BUElfS0VZLFxuICAgICAgICAgICAgQ0xJRU5UX0lEID0gZGF0YS5DTElFTlRfSUQ7XG4gICAgICAgIFxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcbiAgICAgICAgICAgICdhcGlLZXknOiBBUElfS0VZLFxuICAgICAgICAgICAgJ2Rpc2NvdmVyeURvY3MnOiBbZGlzY292ZXJ5VXJsXSxcbiAgICAgICAgICAgICdjbGllbnRJZCc6IENMSUVOVF9JRCxcbiAgICAgICAgICAgICdzY29wZSc6IFNDT1BFXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgR29vZ2xlQXV0aCA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3Igc2lnbi1pbiBzdGF0ZSBjaGFuZ2VzLlxuICAgICAgICAgICAgR29vZ2xlQXV0aC5pc1NpZ25lZEluLmxpc3Rlbih1cGRhdGVTaWduaW5TdGF0dXMpO1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgaW5pdGlhbCBzaWduLWluIHN0YXRlLiAoRGV0ZXJtaW5lIGlmIHVzZXIgaXMgYWxyZWFkeSBzaWduZWQgaW4uKVxuICAgICAgICAgICAgdXBkYXRlU2lnbmluU3RhdHVzKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAuZmFpbCgoKSA9PiBjb25zb2xlLmxvZygnQ291bGQgbm90IGxvYWQgY29uZmlnLmpzb24nKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVBdXRoQ2xpY2soKSB7XG4gICAgaWYgKEdvb2dsZUF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgICAgICAvLyBVc2VyIGlzIGF1dGhvcml6ZWQgYW5kIGhhcyBjbGlja2VkICdTaWduIG91dCcgYnV0dG9uLlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25PdXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2VyIGlzIG5vdCBzaWduZWQgaW4uIFN0YXJ0IEdvb2dsZSBhdXRoIGZsb3cuXG4gICAgICAgIEdvb2dsZUF1dGguc2lnbkluKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2b2tlQWNjZXNzKCkge1xuICAgIEdvb2dsZUF1dGguZGlzY29ubmVjdCgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTaWduaW5TdGF0dXMoaXNTaWduZWRJbjogYm9vbGVhbikge1xuICAgIGxldCB1c2VyID0gR29vZ2xlQXV0aC5jdXJyZW50VXNlci5nZXQoKTtcbiAgICBsZXQgaXNBdXRob3JpemVkID0gdXNlci5oYXNHcmFudGVkU2NvcGVzKFNDT1BFKTtcbiAgICBpZiAoaXNBdXRob3JpemVkKSB7XG4gICAgICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5odG1sKCdTaWduIG91dCcpO1xuICAgICAgICBsZXQgcHJvZmlsZSA9IHVzZXIuZ2V0QmFzaWNQcm9maWxlKCk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoYFdlbGNvbWUsICR7cHJvZmlsZS5nZXROYW1lKCl9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gSW4nKTtcbiAgICAgICAgJCgnI2F1dGgtc3RhdHVzJykuaHRtbCgnJyk7XG4gICAgfVxufVxuXG4iLCIkKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgJCgnI3NldHRpbmdzJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkLmdldCgnc2V0dGluZ3MuaHRtbCcsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICBib290Ym94LmRpYWxvZyh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdTZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YSxcbiAgICAgICAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU2F2ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4tc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogc2F2ZVBhdGhzXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiQ2FuY2VsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0bi1kZWZhdWx0J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdldFBhdGhzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJCgnI2xua19hZGRfaW1wb3J0YW50X2NoYW5nZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgc3ByZWFkc2hlZXRJZCA9ICcxWUtfa1JVZzhaYTd5blRWYkQ3MEF0MzlhX29zbnpoSkJJMk5ma0xTR3Z0TSc7XG4gICAgICAgIGxldCByYW5nZSA9ICdJbXBvcnRhbnQgQ2hhbmdlcyc7XG5cbiAgICAgICAgdmFyIHVybCA9IGVuY29kZVVSSShgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c3ByZWFkc2hlZXRJZH0vdmFsdWVzLyR7cmFuZ2V9OmFwcGVuZD92YWx1ZUlucHV0T3B0aW9uPVVTRVJfRU5URVJFRGApO1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSB7XG4gICAgICAgICAgICBcInZhbHVlc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgIFtcInRlc3RcIiwgXCJoZWxsb1wiLCBcIndvcmxkXCJdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIG1ha2VSZXF1ZXN0KCdQT1NUJywgdXJsLCBKU09OLnN0cmluZ2lmeSh2YWx1ZXMpLCBmdW5jdGlvbihlcnI6IGFueSkge1xuICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjb3JkIGV4cG9ydGVkLicpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG5mdW5jdGlvbiBzYXZlUGF0aHMoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnLCAkKCcjaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpLnZhbCgpKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGljdGlvbmFyeV9wYXRoJywgJCgnI2RpY3Rpb25hcnlfcGF0aCcpLnZhbCgpKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYW5hbHlzdF9zaGVldF9wYXRoJywgJCgnI2FuYWx5c3Rfc2hlZXRfcGF0aCcpLnZhbCgpKTtcbn1cblxuZnVuY3Rpb24gZ2V0UGF0aHMoKSB7XG4gICAgbGV0IGNoYW5nZXNfdXJsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnKTtcbiAgICBsZXQgZGljdGlvbmFyeV91cmwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGljdGlvbmFyeV9wYXRoJyk7XG4gICAgbGV0IGFuYWx5c3RfdXJsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FuYWx5c3Rfc2hlZXRfcGF0aCcpO1xuXG4gICAgJCgnI2FuYWx5c3Rfc2hlZXRfcGF0aCcpLnZhbChhbmFseXN0X3VybCk7XG4gICAgJCgnI2FuYXlsc3Rfc2hlZXRfdXJsJykuYXR0cignaHJlZicsIGFuYWx5c3RfdXJsKTtcblxuICAgICQoJyNpbXBvcnRhbnRfY2hhbmdlc19wYXRoJykudmFsKGNoYW5nZXNfdXJsKTtcbiAgICAkKCcjaW1wb3J0YW50X2NoYW5nZXNfdXJsJykuYXR0cignaHJlZicsIGNoYW5nZXNfdXJsKTtcblxuICAgICQoJyNkaWN0aW9uYXJ5X3BhdGgnKS52YWwoZGljdGlvbmFyeV91cmwpO1xuICAgICQoJyNkaWN0aW9uYXJ5X3VybCcpLmF0dHIoJ2hyZWYnLCBkaWN0aW9uYXJ5X3VybCk7XG59XG5mdW5jdGlvbiBnZXRTcHJlYWRzaGVldElkKHVybDogc3RyaW5nKSB7XG5cbn1cblxuZnVuY3Rpb24gbWFrZVJlcXVlc3QobWV0aG9kOiBzdHJpbmcsIHVybDpzdHJpbmcsIHZhbHVlOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgdmFyIGF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuICBpZiAoIWF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ1NpZ25pbiByZXF1aXJlZC4nKSk7XG4gIH1cbiAgdmFyIGFjY2Vzc1Rva2VuID0gYXV0aC5jdXJyZW50VXNlci5nZXQoKS5nZXRBdXRoUmVzcG9uc2UoKS5hY2Nlc3NfdG9rZW47XG4gICQuYWpheCh1cmwsIHtcbiAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICBkYXRhOiB2YWx1ZSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgYWNjZXNzVG9rZW4sXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihyZXNwb25zZS5yZXNwb25zZUpTT04ubWVzc2FnZSkpO1xuICAgIH1cbiAgfSk7XG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQWxsYW4gUGljaGFyZG8uXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5pbXBvcnQge0dvb2dsZUF1dGh9IGZyb20gJy4vZ29vZ2xlLWF1dGgnO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygncmVhZHknKTtcblxuICAgIC8vIFRPRE86IGRldGVybWluZSBpZiBvbGQgZnVuY3Rpb24gY2FsbHMgYXJlIG5lZWRlZFxuICAgIC8vIHRvZ2dsZVByb2dyZXNzYmFyKGZhbHNlKTtcbiAgICAvLyAkKCcjdG9nZ2xlX3ZpZXcnKS5jbGljayh0b2dnbGVWaWV3KTtcblxuICAgIC8vIHNldFBhZ2luYXRpb24oKVxufSlcblxuLy8gZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcbi8vICAgICB2YXIgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdpbmRleCcpKSB8fCA3O1xuLy8gICAgICQoJyNwcmV2X2luZGV4JykudGV4dChgPC0tIFJvdyAke2luZGV4LTF9YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleC0xfWApO1xuLy8gICAgICQoJyNuZXh0X2luZGV4JykudGV4dChgUm93ICR7aW5kZXgrMX0gLS0+YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleCsxfWApO1xuLy8gfVxuXG5mdW5jdGlvbiBzaG93UGFnZShyb3dfaW5kZXg6IG51bWJlcikge1xuICAgIC8vIGxpbmsgdG8gdGVzdCBzcHJlYWRzaGVldDogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvMTdRQV9DMi1YaExlZnhabFJLdzc0S0RZM1ZOc3RiUHZLM0lIV2x1REpNR1EvZWRpdCNnaWQ9MFxuICAgIHZhciBzaGVldElEID0gJzE3UUFfQzItWGhMZWZ4WmxSS3c3NEtEWTNWTnN0YlB2SzNJSFdsdURKTUdRJ1xuICAgIHZhciByYW5nZSA9IGBBJHtyb3dfaW5kZXh9OkFHJHtyb3dfaW5kZXh9YFxuXG4gICAgLy8gSW5mbyBvbiBzcHJlYWRzaGVldHMudmFsdWVzLmdldDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9yZWZlcmVuY2UvcmVzdC92NC9zcHJlYWRzaGVldHMudmFsdWVzL2dldFxuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG4gICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XG4gICAgICAgICdwYXRoJzogcGF0aCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gd3JpdGUgdG8gc3ByZWFkc2hlZXRzOiBcbiAgICAgICAgLy8gMSkgR2V0IHN0YXJ0ZWQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcXVpY2tzdGFydC9qc1xuICAgICAgICAvLyAyKSBSZWFkL3dyaXRlIGRvY3M6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvZ3VpZGVzL3ZhbHVlc1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSByZXNwb25zZS5yZXN1bHQudmFsdWVzO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcm93X2RhdGEgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB2YXIgb2xkX3VybCA9IHJvd19kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIG5ld191cmwgPSByb3dfZGF0YVs5XTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBzaG91bGQgYmUgcGxhY2VkIGhlcmVcbiAgICAgICAgICAgIC8vIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkSWZyYW1lKGh0bWxfZW1iZWQ6IHN0cmluZykge1xuICAgIC8vIGluamVjdCBodG1sXG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaWZmX3ZpZXcnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzcmNkb2MnLCBodG1sX2VtYmVkKTtcblxuICAgIGlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaW5qZWN0IGRpZmYuY3NzIHRvIGhpZ2hsaWdodCA8aW5zPiBhbmQgPGRlbD4gZWxlbWVudHNcbiAgICAgICAgdmFyIGZybSA9IChmcmFtZXMgYXMgYW55KVsnZGlmZl92aWV3J10uY29udGVudERvY3VtZW50O1xuICAgICAgICB2YXIgb3RoZXJoZWFkID0gZnJtLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgIHZhciBsaW5rID0gZnJtLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdzdHlsZXNoZWV0Jyk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vY3NzL2RpZmYuY3NzYCk7XG4gICAgICAgIG90aGVyaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcblxuICAgICAgICAvLyBzZXQgaWZyYW1lIGhlaWdodCA9IGZyYW1lIGNvbnRlbnRcbiAgICAgICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywoaWZyYW1lIGFzIGFueSkuY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfTtcbn1cbiJdfQ==
