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
    $('#settings').click(function () {
        return $.get('settings.html', function (data) {
            bootbox.dialog({
                title: 'Settings',
                message: data,
                buttons: {
                    "Save": {
                        className: 'btn-success',
                        callback: function () {
                            localStorage.setItem('important_changes_path', $('#important_changes_path').val());
                            localStorage.setItem('dictionary_path', $('#dictionary_path').val());
                        }
                    },
                    "Cancel": {
                        className: 'btn-default'
                    }
                }
            });
            var changes_url = localStorage.getItem('important_changes_path');
            var dictionary_url = localStorage.getItem('dictionary_path');
            $('#important_changes_path').val(changes_url);
            $('#changes_url').attr('href', changes_url);
            $('#dictionary_path').val(dictionary_url);
            $('#dictionary_url').attr('href', dictionary_url);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtc2hlZXRzLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSx1RUFBdUU7QUFFM0QsUUFBQSxLQUFLLEdBQUcsOENBQThDLENBQUM7QUFFbkUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNkLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlCLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzdCLFlBQVksRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0lBRUgsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNqQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBUyxJQUFJO1lBQ3ZDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ1gsS0FBSyxFQUFFLFVBQVU7Z0JBQ2pCLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRTtvQkFDTCxNQUFNLEVBQUU7d0JBQ0osU0FBUyxFQUFFLGFBQWE7d0JBQ3hCLFFBQVEsRUFBRTs0QkFDVixZQUFZLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7NEJBQ25GLFlBQVksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzt3QkFDckUsQ0FBQztxQkFDSjtvQkFDRCxRQUFRLEVBQUU7d0JBQ04sU0FBUyxFQUFFLGFBQWE7cUJBQzNCO2lCQUNKO2FB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QUFJLE1BQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxlQUFlLENBQUM7UUFDdkQsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUssTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLGtCQUFlLENBQUMsQ0FBQztRQUNwRSxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTVCLG9DQUFvQztRQUNwQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFjLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDM0YsQ0FBQyxDQUFDO0FBQ04sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBJbml0aWFsaXplcyBHb29nbGUgQXBpcyBhbmQgZXhwb3J0cyBHb29nbGVBdXRoIG9iamVjdCBmb3IgdXMgdG8gdXNlLlxuZXhwb3J0IGxldCAgR29vZ2xlQXV0aDogZ2FwaS5hdXRoMi5Hb29nbGVBdXRoLFxuICAgICAgICAgICAgU0NPUEUgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9zcHJlYWRzaGVldHMnO1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgaGFuZGxlQ2xpZW50TG9hZCgpO1xuICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGhhbmRsZUF1dGhDbGljaygpO1xuICAgIH0pO1xuICAgICQoJyNyZXZva2UtYWNjZXNzLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV2b2tlQWNjZXNzKCk7XG4gICAgfSk7XG5cbiAgICAkKCcjc2V0dGluZ3MnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICQuZ2V0KCdzZXR0aW5ncy5odG1sJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgYm9vdGJveC5kaWFsb2coe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnU2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRhdGEsXG4gICAgICAgICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgICAgICAgICBcIlNhdmVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYnRuLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnLCAkKCcjaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpLnZhbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkaWN0aW9uYXJ5X3BhdGgnLCAkKCcjZGljdGlvbmFyeV9wYXRoJykudmFsKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIkNhbmNlbFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4tZGVmYXVsdCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGNoYW5nZXNfdXJsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnKTtcbiAgICAgICAgICAgIGxldCBkaWN0aW9uYXJ5X3VybCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkaWN0aW9uYXJ5X3BhdGgnKTtcblxuICAgICAgICAgICAgJCgnI2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnKS52YWwoY2hhbmdlc191cmwpO1xuICAgICAgICAgICAgJCgnI2NoYW5nZXNfdXJsJykuYXR0cignaHJlZicsIGNoYW5nZXNfdXJsKTtcbiAgICAgICAgICAgICQoJyNkaWN0aW9uYXJ5X3BhdGgnKS52YWwoZGljdGlvbmFyeV91cmwpO1xuICAgICAgICAgICAgJCgnI2RpY3Rpb25hcnlfdXJsJykuYXR0cignaHJlZicsIGRpY3Rpb25hcnlfdXJsKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkKCcjbG5rX2FkZF9pbXBvcnRhbnRfY2hhbmdlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBzcHJlYWRzaGVldElkID0gJzFZS19rUlVnOFphN3luVFZiRDcwQXQzOWFfb3NuemhKQkkyTmZrTFNHdnRNJztcbiAgICAgICAgbGV0IHJhbmdlID0gJ0ltcG9ydGFudCBDaGFuZ2VzJztcblxuICAgICAgICB2YXIgdXJsID0gZW5jb2RlVVJJKGBodHRwczovL3NoZWV0cy5nb29nbGVhcGlzLmNvbS92NC9zcHJlYWRzaGVldHMvJHtzcHJlYWRzaGVldElkfS92YWx1ZXMvJHtyYW5nZX06YXBwZW5kP3ZhbHVlSW5wdXRPcHRpb249VVNFUl9FTlRFUkVEYCk7XG5cbiAgICAgICAgdmFyIHZhbHVlcyA9IHtcbiAgICAgICAgICAgIFwidmFsdWVzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgW1widGVzdFwiLCBcImhlbGxvXCIsIFwid29ybGRcIl1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgbWFrZVJlcXVlc3QoJ1BPU1QnLCB1cmwsIEpTT04uc3RyaW5naWZ5KHZhbHVlcyksIGZ1bmN0aW9uKGVycjogYW55KSB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNvcmQgZXhwb3J0ZWQuJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbmZ1bmN0aW9uIGhhbmRsZUNsaWVudExvYWQoKSB7XG4gICAgLy8gTG9hZCB0aGUgQVBJJ3MgY2xpZW50IGFuZCBhdXRoMiBtb2R1bGVzLlxuICAgIC8vIENhbGwgdGhlIGluaXRDbGllbnQgZnVuY3Rpb24gYWZ0ZXIgdGhlIG1vZHVsZXMgbG9hZC5cbiAgICAvLyBnYXBpIGlzIGEgZ2xvYmFsIHZhcmlhYmxlIGNyZWF0ZWQgYnkgdGhlIGdvb2dsZSBhcGkgc2NyaXB0XG4gICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCBpbml0Q2xpZW50KTtcbn1cblxuZnVuY3Rpb24gaW5pdENsaWVudCgpIHtcbiAgICAvLyBSZXRyaWV2ZSB0aGUgZGlzY292ZXJ5IGRvY3VtZW50IGZvciB2ZXJzaW9uIDQgb2YgR29vZ2xlIFNoZWV0cyBBUEkuXG4gICAgLy8gVGhpcyB3aWxsIHBvcHVsYXRlIG1ldGhvZHMgb24gZ2FwaSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZSBhcGkuXG4gICAgbGV0IGRpc2NvdmVyeVVybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9zaGVldHMvdjQvcmVzdCc7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBnYXBpLmNsaWVudCBvYmplY3QsIHdoaWNoIHRoZSBhcHAgdXNlcyB0byBtYWtlIEFQSSByZXF1ZXN0cy5cbiAgICAvLyBHZXQgQVBJIGtleSBhbmQgY2xpZW50IElEIGZyb20gY29uZmlnLmpzb24uXG4gICAgLy8gJ3Njb3BlJyBmaWVsZCBzcGVjaWZpZXMgc3BhY2UtZGVsaW1pdGVkIGxpc3Qgb2YgYWNjZXNzIHNjb3Blcy5cbiAgICAkLmdldEpTT04oJy4vY29uZmlnLmpzb24nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBsZXQgQVBJX0tFWSA9IGRhdGEuQVBJX0tFWSxcbiAgICAgICAgICAgIENMSUVOVF9JRCA9IGRhdGEuQ0xJRU5UX0lEO1xuICAgICAgICBcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XG4gICAgICAgICAgICAnYXBpS2V5JzogQVBJX0tFWSxcbiAgICAgICAgICAgICdkaXNjb3ZlcnlEb2NzJzogW2Rpc2NvdmVyeVVybF0sXG4gICAgICAgICAgICAnY2xpZW50SWQnOiBDTElFTlRfSUQsXG4gICAgICAgICAgICAnc2NvcGUnOiBTQ09QRVxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdvb2dsZUF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIHNpZ24taW4gc3RhdGUgY2hhbmdlcy5cbiAgICAgICAgICAgIEdvb2dsZUF1dGguaXNTaWduZWRJbi5saXN0ZW4odXBkYXRlU2lnbmluU3RhdHVzKTtcblxuICAgICAgICAgICAgLy8gSGFuZGxlIGluaXRpYWwgc2lnbi1pbiBzdGF0ZS4gKERldGVybWluZSBpZiB1c2VyIGlzIGFscmVhZHkgc2lnbmVkIGluLilcbiAgICAgICAgICAgIHVwZGF0ZVNpZ25pblN0YXR1cyhmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLmZhaWwoKCkgPT4gY29uc29sZS5sb2coJ0NvdWxkIG5vdCBsb2FkIGNvbmZpZy5qc29uJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKCkge1xuICAgIGlmIChHb29nbGVBdXRoLmlzU2lnbmVkSW4uZ2V0KCkpIHtcbiAgICAgICAgLy8gVXNlciBpcyBhdXRob3JpemVkIGFuZCBoYXMgY2xpY2tlZCAnU2lnbiBvdXQnIGJ1dHRvbi5cbiAgICAgICAgR29vZ2xlQXV0aC5zaWduT3V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVXNlciBpcyBub3Qgc2lnbmVkIGluLiBTdGFydCBHb29nbGUgYXV0aCBmbG93LlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25JbigpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldm9rZUFjY2VzcygpIHtcbiAgICBHb29nbGVBdXRoLmRpc2Nvbm5lY3QoKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU2lnbmluU3RhdHVzKGlzU2lnbmVkSW46IGJvb2xlYW4pIHtcbiAgICBsZXQgdXNlciA9IEdvb2dsZUF1dGguY3VycmVudFVzZXIuZ2V0KCk7XG4gICAgbGV0IGlzQXV0aG9yaXplZCA9IHVzZXIuaGFzR3JhbnRlZFNjb3BlcyhTQ09QRSk7XG4gICAgaWYgKGlzQXV0aG9yaXplZCkge1xuICAgICAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuaHRtbCgnU2lnbiBvdXQnKTtcbiAgICAgICAgbGV0IHByb2ZpbGUgPSB1c2VyLmdldEJhc2ljUHJvZmlsZSgpO1xuICAgICAgICAkKCcjYXV0aC1zdGF0dXMnKS5odG1sKGBXZWxjb21lLCAke3Byb2ZpbGUuZ2V0TmFtZSgpfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5odG1sKCdTaWduIEluJyk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoJycpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFrZVJlcXVlc3QobWV0aG9kOiBzdHJpbmcsIHVybDpzdHJpbmcsIHZhbHVlOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgdmFyIGF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuICBpZiAoIWF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ1NpZ25pbiByZXF1aXJlZC4nKSk7XG4gIH1cbiAgdmFyIGFjY2Vzc1Rva2VuID0gYXV0aC5jdXJyZW50VXNlci5nZXQoKS5nZXRBdXRoUmVzcG9uc2UoKS5hY2Nlc3NfdG9rZW47XG4gICQuYWpheCh1cmwsIHtcbiAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICBkYXRhOiB2YWx1ZSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgYWNjZXNzVG9rZW4sXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihyZXNwb25zZS5yZXNwb25zZUpTT04ubWVzc2FnZSkpO1xuICAgIH1cbiAgfSk7XG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQWxsYW4gUGljaGFyZG8uXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5pbXBvcnQge0dvb2dsZUF1dGh9IGZyb20gXCIuL2dvb2dsZS1zaGVldHNcIjtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJyZWFkeVwiKTtcblxuICAgIC8vIFRPRE86IGRldGVybWluZSBpZiBvbGQgZnVuY3Rpb24gY2FsbHMgYXJlIG5lZWRlZFxuICAgIC8vIHRvZ2dsZVByb2dyZXNzYmFyKGZhbHNlKTtcbiAgICAvLyAkKCcjdG9nZ2xlX3ZpZXcnKS5jbGljayh0b2dnbGVWaWV3KTtcblxuICAgIC8vIHNldFBhZ2luYXRpb24oKVxufSlcblxuLy8gZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcbi8vICAgICB2YXIgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdpbmRleCcpKSB8fCA3O1xuLy8gICAgICQoJyNwcmV2X2luZGV4JykudGV4dChgPC0tIFJvdyAke2luZGV4LTF9YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleC0xfWApO1xuLy8gICAgICQoJyNuZXh0X2luZGV4JykudGV4dChgUm93ICR7aW5kZXgrMX0gLS0+YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleCsxfWApO1xuLy8gfVxuXG5mdW5jdGlvbiBzaG93UGFnZShyb3dfaW5kZXg6IG51bWJlcikge1xuICAgIC8vIGxpbmsgdG8gdGVzdCBzcHJlYWRzaGVldDogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvMTdRQV9DMi1YaExlZnhabFJLdzc0S0RZM1ZOc3RiUHZLM0lIV2x1REpNR1EvZWRpdCNnaWQ9MFxuICAgIHZhciBzaGVldElEID0gJzE3UUFfQzItWGhMZWZ4WmxSS3c3NEtEWTNWTnN0YlB2SzNJSFdsdURKTUdRJ1xuICAgIHZhciByYW5nZSA9IGBBJHtyb3dfaW5kZXh9OkFHJHtyb3dfaW5kZXh9YFxuXG4gICAgLy8gSW5mbyBvbiBzcHJlYWRzaGVldHMudmFsdWVzLmdldDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9yZWZlcmVuY2UvcmVzdC92NC9zcHJlYWRzaGVldHMudmFsdWVzL2dldFxuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG4gICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XG4gICAgICAgICdwYXRoJzogcGF0aCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gd3JpdGUgdG8gc3ByZWFkc2hlZXRzOiBcbiAgICAgICAgLy8gMSkgR2V0IHN0YXJ0ZWQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcXVpY2tzdGFydC9qc1xuICAgICAgICAvLyAyKSBSZWFkL3dyaXRlIGRvY3M6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvZ3VpZGVzL3ZhbHVlc1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSByZXNwb25zZS5yZXN1bHQudmFsdWVzO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcm93X2RhdGEgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB2YXIgb2xkX3VybCA9IHJvd19kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIG5ld191cmwgPSByb3dfZGF0YVs5XTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBzaG91bGQgYmUgcGxhY2VkIGhlcmVcbiAgICAgICAgICAgIC8vIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkSWZyYW1lKGh0bWxfZW1iZWQ6IHN0cmluZykge1xuICAgIC8vIGluamVjdCBodG1sXG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaWZmX3ZpZXcnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzcmNkb2MnLCBodG1sX2VtYmVkKTtcblxuICAgIGlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaW5qZWN0IGRpZmYuY3NzIHRvIGhpZ2hsaWdodCA8aW5zPiBhbmQgPGRlbD4gZWxlbWVudHNcbiAgICAgICAgdmFyIGZybSA9IChmcmFtZXMgYXMgYW55KVsnZGlmZl92aWV3J10uY29udGVudERvY3VtZW50O1xuICAgICAgICB2YXIgb3RoZXJoZWFkID0gZnJtLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcbiAgICAgICAgdmFyIGxpbmsgPSBmcm0uY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwic3R5bGVzaGVldFwiKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9jc3MvZGlmZi5jc3NgKTtcbiAgICAgICAgb3RoZXJoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuXG4gICAgICAgIC8vIHNldCBpZnJhbWUgaGVpZ2h0ID0gZnJhbWUgY29udGVudFxuICAgICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLChpZnJhbWUgYXMgYW55KS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9O1xufVxuIl19
