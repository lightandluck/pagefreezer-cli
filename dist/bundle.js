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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtc2hlZXRzLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSx1RUFBdUU7QUFFM0QsUUFBQSxLQUFLLEdBQUcsOENBQThDLENBQUM7QUFFbkUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNkLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlCLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzdCLFlBQVksRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0lBRUgsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNqQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBUyxJQUFJO1lBQ3ZDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ1gsS0FBSyxFQUFFLFVBQVU7Z0JBQ2pCLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRTtvQkFDTCxNQUFNLEVBQUU7d0JBQ0osU0FBUyxFQUFFLGFBQWE7d0JBQ3hCLFFBQVEsRUFBRTs0QkFDVixZQUFZLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7NEJBQ25GLFlBQVksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzt3QkFDckUsQ0FBQztxQkFDSjtvQkFDRCxRQUFRLEVBQUU7d0JBQ04sU0FBUyxFQUFFLGFBQWE7cUJBQzNCO2lCQUNKO2FB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O1FBQ3BFLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsb0NBQW9DO1FBQ3BDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQWMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRixDQUFDLENBQUM7QUFDTixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEluaXRpYWxpemVzIEdvb2dsZSBBcGlzIGFuZCBleHBvcnRzIEdvb2dsZUF1dGggb2JqZWN0IGZvciB1cyB0byB1c2UuXG5leHBvcnQgbGV0ICBHb29nbGVBdXRoOiBnYXBpLmF1dGgyLkdvb2dsZUF1dGgsXG4gICAgICAgICAgICBTQ09QRSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3NwcmVhZHNoZWV0cyc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBoYW5kbGVDbGllbnRMb2FkKCk7XG4gICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaGFuZGxlQXV0aENsaWNrKCk7XG4gICAgfSk7XG4gICAgJCgnI3Jldm9rZS1hY2Nlc3MtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICByZXZva2VBY2Nlc3MoKTtcbiAgICB9KTtcblxuICAgICQoJyNzZXR0aW5ncycpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJC5nZXQoJ3NldHRpbmdzLmh0bWwnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBib290Ym94LmRpYWxvZyh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdTZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YSxcbiAgICAgICAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU2F2ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4tc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcsICQoJyNpbXBvcnRhbnRfY2hhbmdlc19wYXRoJykudmFsKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RpY3Rpb25hcnlfcGF0aCcsICQoJyNkaWN0aW9uYXJ5X3BhdGgnKS52YWwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiQ2FuY2VsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0bi1kZWZhdWx0J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgY2hhbmdlc191cmwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpO1xuICAgICAgICAgICAgbGV0IGRpY3Rpb25hcnlfdXJsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RpY3Rpb25hcnlfcGF0aCcpO1xuXG4gICAgICAgICAgICAkKCcjaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpLnZhbChjaGFuZ2VzX3VybCk7XG4gICAgICAgICAgICAkKCcjY2hhbmdlc191cmwnKS5hdHRyKCdocmVmJywgY2hhbmdlc191cmwpO1xuICAgICAgICAgICAgJCgnI2RpY3Rpb25hcnlfcGF0aCcpLnZhbChkaWN0aW9uYXJ5X3VybCk7XG4gICAgICAgICAgICAkKCcjZGljdGlvbmFyeV91cmwnKS5hdHRyKCdocmVmJywgZGljdGlvbmFyeV91cmwpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG5mdW5jdGlvbiBoYW5kbGVDbGllbnRMb2FkKCkge1xuICAgIC8vIExvYWQgdGhlIEFQSSdzIGNsaWVudCBhbmQgYXV0aDIgbW9kdWxlcy5cbiAgICAvLyBDYWxsIHRoZSBpbml0Q2xpZW50IGZ1bmN0aW9uIGFmdGVyIHRoZSBtb2R1bGVzIGxvYWQuXG4gICAgLy8gZ2FwaSBpcyBhIGdsb2JhbCB2YXJpYWJsZSBjcmVhdGVkIGJ5IHRoZSBnb29nbGUgYXBpIHNjcmlwdFxuICAgIGdhcGkubG9hZCgnY2xpZW50OmF1dGgyJywgaW5pdENsaWVudCk7XG59XG5cbmZ1bmN0aW9uIGluaXRDbGllbnQoKSB7XG4gICAgLy8gUmV0cmlldmUgdGhlIGRpc2NvdmVyeSBkb2N1bWVudCBmb3IgdmVyc2lvbiA0IG9mIEdvb2dsZSBTaGVldHMgQVBJLlxuICAgIC8vIFRoaXMgd2lsbCBwb3B1bGF0ZSBtZXRob2RzIG9uIGdhcGkgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIHVzZSB0aGUgYXBpLlxuICAgIGxldCBkaXNjb3ZlcnlVcmwgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZGlzY292ZXJ5L3YxL2FwaXMvc2hlZXRzL3Y0L3Jlc3QnO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgZ2FwaS5jbGllbnQgb2JqZWN0LCB3aGljaCB0aGUgYXBwIHVzZXMgdG8gbWFrZSBBUEkgcmVxdWVzdHMuXG4gICAgLy8gR2V0IEFQSSBrZXkgYW5kIGNsaWVudCBJRCBmcm9tIGNvbmZpZy5qc29uLlxuICAgIC8vICdzY29wZScgZmllbGQgc3BlY2lmaWVzIHNwYWNlLWRlbGltaXRlZCBsaXN0IG9mIGFjY2VzcyBzY29wZXMuXG4gICAgJC5nZXRKU09OKCcuL2NvbmZpZy5qc29uJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgbGV0IEFQSV9LRVkgPSBkYXRhLkFQSV9LRVksXG4gICAgICAgICAgICBDTElFTlRfSUQgPSBkYXRhLkNMSUVOVF9JRDtcbiAgICAgICAgXG4gICAgICAgIGdhcGkuY2xpZW50LmluaXQoe1xuICAgICAgICAgICAgJ2FwaUtleSc6IEFQSV9LRVksXG4gICAgICAgICAgICAnZGlzY292ZXJ5RG9jcyc6IFtkaXNjb3ZlcnlVcmxdLFxuICAgICAgICAgICAgJ2NsaWVudElkJzogQ0xJRU5UX0lELFxuICAgICAgICAgICAgJ3Njb3BlJzogU0NPUEVcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBHb29nbGVBdXRoID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBzaWduLWluIHN0YXRlIGNoYW5nZXMuXG4gICAgICAgICAgICBHb29nbGVBdXRoLmlzU2lnbmVkSW4ubGlzdGVuKHVwZGF0ZVNpZ25pblN0YXR1cyk7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBpbml0aWFsIHNpZ24taW4gc3RhdGUuIChEZXRlcm1pbmUgaWYgdXNlciBpcyBhbHJlYWR5IHNpZ25lZCBpbi4pXG4gICAgICAgICAgICB1cGRhdGVTaWduaW5TdGF0dXMoZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5mYWlsKCgpID0+IGNvbnNvbGUubG9nKCdDb3VsZCBub3QgbG9hZCBjb25maWcuanNvbicpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUF1dGhDbGljaygpIHtcbiAgICBpZiAoR29vZ2xlQXV0aC5pc1NpZ25lZEluLmdldCgpKSB7XG4gICAgICAgIC8vIFVzZXIgaXMgYXV0aG9yaXplZCBhbmQgaGFzIGNsaWNrZWQgJ1NpZ24gb3V0JyBidXR0b24uXG4gICAgICAgIEdvb2dsZUF1dGguc2lnbk91dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVzZXIgaXMgbm90IHNpZ25lZCBpbi4gU3RhcnQgR29vZ2xlIGF1dGggZmxvdy5cbiAgICAgICAgR29vZ2xlQXV0aC5zaWduSW4oKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZva2VBY2Nlc3MoKSB7XG4gICAgR29vZ2xlQXV0aC5kaXNjb25uZWN0KCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNpZ25pblN0YXR1cyhpc1NpZ25lZEluOiBib29sZWFuKSB7XG4gICAgbGV0IHVzZXIgPSBHb29nbGVBdXRoLmN1cnJlbnRVc2VyLmdldCgpO1xuICAgIGxldCBpc0F1dGhvcml6ZWQgPSB1c2VyLmhhc0dyYW50ZWRTY29wZXMoU0NPUEUpO1xuICAgIGlmIChpc0F1dGhvcml6ZWQpIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gb3V0Jyk7XG4gICAgICAgIGxldCBwcm9maWxlID0gdXNlci5nZXRCYXNpY1Byb2ZpbGUoKTtcbiAgICAgICAgJCgnI2F1dGgtc3RhdHVzJykuaHRtbChgV2VsY29tZSwgJHtwcm9maWxlLmdldE5hbWUoKX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuaHRtbCgnU2lnbiBJbicpO1xuICAgICAgICAkKCcjYXV0aC1zdGF0dXMnKS5odG1sKCcnKTtcbiAgICB9XG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAxNyBBbGxhbiBQaWNoYXJkby5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmltcG9ydCB7R29vZ2xlQXV0aH0gZnJvbSBcIi4vZ29vZ2xlLXNoZWV0c1wiO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcInJlYWR5XCIpO1xuXG4gICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBhcmUgbmVlZGVkXG4gICAgLy8gdG9nZ2xlUHJvZ3Jlc3NiYXIoZmFsc2UpO1xuICAgIC8vICQoJyN0b2dnbGVfdmlldycpLmNsaWNrKHRvZ2dsZVZpZXcpO1xuXG4gICAgLy8gc2V0UGFnaW5hdGlvbigpXG59KVxuXG4vLyBmdW5jdGlvbiBzZXRQYWdpbmF0aW9uKCkge1xuLy8gICAgIHZhciB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuLy8gICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHVybFBhcmFtcy5nZXQoJ2luZGV4JykpIHx8IDc7XG4vLyAgICAgJCgnI3ByZXZfaW5kZXgnKS50ZXh0KGA8LS0gUm93ICR7aW5kZXgtMX1gKS5hdHRyKCdocmVmJywgYC9kaWZmYnlpbmRleD9pbmRleD0ke2luZGV4LTF9YCk7XG4vLyAgICAgJCgnI25leHRfaW5kZXgnKS50ZXh0KGBSb3cgJHtpbmRleCsxfSAtLT5gKS5hdHRyKCdocmVmJywgYC9kaWZmYnlpbmRleD9pbmRleD0ke2luZGV4KzF9YCk7XG4vLyB9XG5cbmZ1bmN0aW9uIHNob3dQYWdlKHJvd19pbmRleDogbnVtYmVyKSB7XG4gICAgLy8gbGluayB0byB0ZXN0IHNwcmVhZHNoZWV0OiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9zcHJlYWRzaGVldHMvZC8xN1FBX0MyLVhoTGVmeFpsUkt3NzRLRFkzVk5zdGJQdkszSUhXbHVESk1HUS9lZGl0I2dpZD0wXG4gICAgdmFyIHNoZWV0SUQgPSAnMTdRQV9DMi1YaExlZnhabFJLdzc0S0RZM1ZOc3RiUHZLM0lIV2x1REpNR1EnXG4gICAgdmFyIHJhbmdlID0gYEEke3Jvd19pbmRleH06QUcke3Jvd19pbmRleH1gXG5cbiAgICAvLyBJbmZvIG9uIHNwcmVhZHNoZWV0cy52YWx1ZXMuZ2V0OiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9zaGVldHMvYXBpL3JlZmVyZW5jZS9yZXN0L3Y0L3NwcmVhZHNoZWV0cy52YWx1ZXMvZ2V0XG4gICAgdmFyIHBhdGggPSBgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c2hlZXRJRH0vdmFsdWVzLyR7cmFuZ2V9YDtcbiAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcbiAgICAgICAgJ3BhdGgnOiBwYXRoLFxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgLy8gSWYgd2UgbmVlZCB0byB3cml0ZSB0byBzcHJlYWRzaGVldHM6IFxuICAgICAgICAvLyAxKSBHZXQgc3RhcnRlZDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9xdWlja3N0YXJ0L2pzXG4gICAgICAgIC8vIDIpIFJlYWQvd3JpdGUgZG9jczogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9ndWlkZXMvdmFsdWVzXG5cbiAgICAgICAgdmFyIHZhbHVlcyA9IHJlc3BvbnNlLnJlc3VsdC52YWx1ZXM7XG4gICAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciByb3dfZGF0YSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgIHZhciBvbGRfdXJsID0gcm93X2RhdGFbOF07XG4gICAgICAgICAgICB2YXIgbmV3X3VybCA9IHJvd19kYXRhWzldO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3dfZGF0YSk7XG4gICAgICAgICAgICAvLyBUT0RPOiBkZXRlcm1pbmUgaWYgb2xkIGZ1bmN0aW9uIGNhbGxzIHNob3VsZCBiZSBwbGFjZWQgaGVyZVxuICAgICAgICAgICAgLy8gc2hvd0RpZmZNZXRhZGF0YShyb3dfZGF0YSk7XG4gICAgICAgICAgICAvLyBydW5EaWZmKG9sZF91cmwsIG5ld191cmwpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcjZGlmZl90aXRsZScpLnRleHQoJ05vIGRhdGEgZm91bmQnKVxuICAgICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6ICcgKyByZXNwb25zZS5yZXN1bHQuZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGxvYWRJZnJhbWUoaHRtbF9lbWJlZDogc3RyaW5nKSB7XG4gICAgLy8gaW5qZWN0IGh0bWxcbiAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpZmZfdmlldycpO1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyY2RvYycsIGh0bWxfZW1iZWQpO1xuXG4gICAgaWZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBpbmplY3QgZGlmZi5jc3MgdG8gaGlnaGxpZ2h0IDxpbnM+IGFuZCA8ZGVsPiBlbGVtZW50c1xuICAgICAgICB2YXIgZnJtID0gKGZyYW1lcyBhcyBhbnkpWydkaWZmX3ZpZXcnXS5jb250ZW50RG9jdW1lbnQ7XG4gICAgICAgIHZhciBvdGhlcmhlYWQgPSBmcm0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xuICAgICAgICB2YXIgbGluayA9IGZybS5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJyZWxcIiwgXCJzdHlsZXNoZWV0XCIpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0L2Nzc1wiKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59L2Nzcy9kaWZmLmNzc2ApO1xuICAgICAgICBvdGhlcmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG5cbiAgICAgICAgLy8gc2V0IGlmcmFtZSBoZWlnaHQgPSBmcmFtZSBjb250ZW50XG4gICAgICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsKGlmcmFtZSBhcyBhbnkpLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQpO1xuICAgIH07XG59XG4iXX0=
