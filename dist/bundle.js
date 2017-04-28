(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
// Initializes Google Apis and exports GoogleAuth object for us to use.
exports.gapiCallbacks = [];
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
        }).then(gapiLoaded);
    })
        .fail(function () { return console.log('Could not load config.json'); });
}
function gapiLoaded() {
    var GapiQueue = function () {
        this.push = function (callback) {
            setTimeout(callback, 0);
        };
    };
    var _old_gapiCallbacks = exports.gapiCallbacks;
    exports.gapiCallbacks = new GapiQueue();
    _old_gapiCallbacks.forEach(function (callback) {
        exports.gapiCallbacks.push(callback);
    });
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
    //TODO - create init function to show settings if none exist
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
    $('#analyst_sheet_url').attr('href', analyst_sheet_path);
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
"use strict";
function getList() {
    var sheetID = localStorage.getItem('analyst_spreadsheetId');
    var range = 'A7:AE';
    var path = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetID + "/values/" + range;
    gapi.client.request({
        'path': path,
    }).then(function (response) {
        console.log(response);
    }, function (response) {
        console.error('Error: fix me');
    });
}
exports.getList = getList;
function getTableRow(record) {
}
exports.getTableRow = getTableRow;
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
exports.showPage = showPage;
function updateRecord() {
}
exports.updateRecord = updateRecord;
function showMetadata() {
}
exports.showMetadata = showMetadata;
function setPagination() {
}
exports.setPagination = setPagination;
// function setPagination() {
//     var urlParams = new URLSearchParams(window.location.search);
//     var index = parseInt(urlParams.get('index')) || 7;
//     $('#prev_index').text(`<-- Row ${index-1}`).attr('href', `/diffbyindex?index=${index-1}`);
//     $('#next_index').text(`Row ${index+1} -->`).attr('href', `/diffbyindex?index=${index+1}`);
// } 

},{}],4:[function(require,module,exports){
"use strict";
var listview_google_1 = require("./listview-google");
var google_auth_1 = require("./google-auth");
$(document).ready(function () {
    // setup handlers 
    $('#lnk_toggle_signifiers').click(toggleSignifierAbbreviations);
    $('#lnk_view_list').click(toggleListView);
    google_auth_1.gapiCallbacks.push(function () {
        // .. Do something with gapi, as it is defined and initialized
        listview_google_1.getList();
    });
});
function toggleListView() {
    $('#container_list_view').show();
    $('#container_page_view').hide();
}
function togglePageView() {
    $('#container_list_view').hide();
    $('#container_page_view').show();
}
function toggleProgressbar(isVisible) {
    if (isVisible) {
        $('.progress').show();
    }
    else {
        $('.progress').hide();
    }
}
function toggleSignifierAbbreviations(e) {
    e.preventDefault();
    $('.info-text').toggle();
    $('#inspectorView').toggleClass('short-view');
}
function getTableHeader() {
    return $('<tr>').append($('<th>').text('ID'), $('<th>').text('Output Date'), $('<th>').text('Site'), $('<th>').text('Page Name'), $('<th>').text('Url'), $('<th>').text('Page View Url'), $('<th>').text('Last Two'), $('<th>').text('Latest to Base'));
}

},{"./google-auth":1,"./listview-google":3}],5:[function(require,module,exports){
$(document).ready(function () {
    console.log('ready');
});
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

},{}]},{},[5,1,2,3,4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtYXV0aC50cyIsInNyYy9zY3JpcHRzL2dvb2dsZS1zaGVldHMudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy1nb29nbGUudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy50cyIsInNyYy9zY3JpcHRzL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsdUVBQXVFO0FBQzVELFFBQUEsYUFBYSxHQUFVLEVBQUUsQ0FBQztBQUd6QixRQUFBLEtBQUssR0FBRyw4Q0FBOEMsQ0FBQztBQUVuRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2QsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQixDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUIsZUFBZSxFQUFFLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0ksMkNBQTJDO0lBQzNDLHVEQUF1RDtJQUN2RCw2REFBNkQ7SUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVEO0lBQ0ksc0VBQXNFO0lBQ3RFLHdFQUF3RTtJQUN4RSxJQUFJLFlBQVksR0FBRyw2REFBNkQsQ0FBQztJQUVqRiw4RUFBOEU7SUFDOUUsOENBQThDO0lBQzlDLGlFQUFpRTtJQUNqRSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxVQUFVLElBQUk7UUFDckMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFDdEIsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDYixRQUFRLEVBQUUsT0FBTztZQUNqQixlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsVUFB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QVksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxrQkFBZSxDQUFDLENBQUM7UUFDcEUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1QixvQ0FBb0M7UUFDcEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBYyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNGLENBQUMsQ0FBQztBQUNOLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gSW5pdGlhbGl6ZXMgR29vZ2xlIEFwaXMgYW5kIGV4cG9ydHMgR29vZ2xlQXV0aCBvYmplY3QgZm9yIHVzIHRvIHVzZS5cbmV4cG9ydCBsZXQgZ2FwaUNhbGxiYWNrczogYW55W10gPSBbXTtcblxuZXhwb3J0IGxldCAgR29vZ2xlQXV0aDogZ2FwaS5hdXRoMi5Hb29nbGVBdXRoLFxuICAgICAgICAgICAgU0NPUEUgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9zcHJlYWRzaGVldHMnO1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgaGFuZGxlQ2xpZW50TG9hZCgpO1xuICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGhhbmRsZUF1dGhDbGljaygpO1xuICAgIH0pO1xufSk7XG5cbmZ1bmN0aW9uIGhhbmRsZUNsaWVudExvYWQoKSB7XG4gICAgLy8gTG9hZCB0aGUgQVBJJ3MgY2xpZW50IGFuZCBhdXRoMiBtb2R1bGVzLlxuICAgIC8vIENhbGwgdGhlIGluaXRDbGllbnQgZnVuY3Rpb24gYWZ0ZXIgdGhlIG1vZHVsZXMgbG9hZC5cbiAgICAvLyBnYXBpIGlzIGEgZ2xvYmFsIHZhcmlhYmxlIGNyZWF0ZWQgYnkgdGhlIGdvb2dsZSBhcGkgc2NyaXB0XG4gICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCBpbml0Q2xpZW50KTtcbn1cblxuZnVuY3Rpb24gaW5pdENsaWVudCgpIHtcbiAgICAvLyBSZXRyaWV2ZSB0aGUgZGlzY292ZXJ5IGRvY3VtZW50IGZvciB2ZXJzaW9uIDQgb2YgR29vZ2xlIFNoZWV0cyBBUEkuXG4gICAgLy8gVGhpcyB3aWxsIHBvcHVsYXRlIG1ldGhvZHMgb24gZ2FwaSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZSBhcGkuXG4gICAgbGV0IGRpc2NvdmVyeVVybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9zaGVldHMvdjQvcmVzdCc7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBnYXBpLmNsaWVudCBvYmplY3QsIHdoaWNoIHRoZSBhcHAgdXNlcyB0byBtYWtlIEFQSSByZXF1ZXN0cy5cbiAgICAvLyBHZXQgQVBJIGtleSBhbmQgY2xpZW50IElEIGZyb20gY29uZmlnLmpzb24uXG4gICAgLy8gJ3Njb3BlJyBmaWVsZCBzcGVjaWZpZXMgc3BhY2UtZGVsaW1pdGVkIGxpc3Qgb2YgYWNjZXNzIHNjb3Blcy5cbiAgICAkLmdldEpTT04oJy4vY29uZmlnLmpzb24nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBsZXQgQVBJX0tFWSA9IGRhdGEuQVBJX0tFWSxcbiAgICAgICAgICAgIENMSUVOVF9JRCA9IGRhdGEuQ0xJRU5UX0lEO1xuICAgICAgICBcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XG4gICAgICAgICAgICAnYXBpS2V5JzogQVBJX0tFWSxcbiAgICAgICAgICAgICdkaXNjb3ZlcnlEb2NzJzogW2Rpc2NvdmVyeVVybF0sXG4gICAgICAgICAgICAnY2xpZW50SWQnOiBDTElFTlRfSUQsXG4gICAgICAgICAgICAnc2NvcGUnOiBTQ09QRVxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdvb2dsZUF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIHNpZ24taW4gc3RhdGUgY2hhbmdlcy5cbiAgICAgICAgICAgIEdvb2dsZUF1dGguaXNTaWduZWRJbi5saXN0ZW4odXBkYXRlU2lnbmluU3RhdHVzKTtcblxuICAgICAgICAgICAgLy8gSGFuZGxlIGluaXRpYWwgc2lnbi1pbiBzdGF0ZS4gKERldGVybWluZSBpZiB1c2VyIGlzIGFscmVhZHkgc2lnbmVkIGluLilcbiAgICAgICAgICAgIHVwZGF0ZVNpZ25pblN0YXR1cyhmYWxzZSk7XG4gICAgICAgIH0pLnRoZW4oZ2FwaUxvYWRlZCk7XG4gICAgfSlcbiAgICAuZmFpbCgoKSA9PiBjb25zb2xlLmxvZygnQ291bGQgbm90IGxvYWQgY29uZmlnLmpzb24nKSk7XG59XG5cbmZ1bmN0aW9uIGdhcGlMb2FkZWQoKXtcbiAgICB2YXIgR2FwaVF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnB1c2ggPSBmdW5jdGlvbiAoY2FsbGJhY2s6IGFueSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgMCk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICB2YXIgX29sZF9nYXBpQ2FsbGJhY2tzID0gZ2FwaUNhbGxiYWNrcztcbiAgICBnYXBpQ2FsbGJhY2tzID0gbmV3IEdhcGlRdWV1ZSgpO1xuICAgIF9vbGRfZ2FwaUNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBnYXBpQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKCkge1xuICAgIGlmIChHb29nbGVBdXRoLmlzU2lnbmVkSW4uZ2V0KCkpIHtcbiAgICAgICAgLy8gVXNlciBpcyBhdXRob3JpemVkIGFuZCBoYXMgY2xpY2tlZCAnU2lnbiBvdXQnIGJ1dHRvbi5cbiAgICAgICAgR29vZ2xlQXV0aC5zaWduT3V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVXNlciBpcyBub3Qgc2lnbmVkIGluLiBTdGFydCBHb29nbGUgYXV0aCBmbG93LlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25JbigpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldm9rZUFjY2VzcygpIHtcbiAgICBHb29nbGVBdXRoLmRpc2Nvbm5lY3QoKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU2lnbmluU3RhdHVzKGlzU2lnbmVkSW46IGJvb2xlYW4pIHtcbiAgICBsZXQgdXNlciA9IEdvb2dsZUF1dGguY3VycmVudFVzZXIuZ2V0KCk7XG4gICAgbGV0IGlzQXV0aG9yaXplZCA9IHVzZXIuaGFzR3JhbnRlZFNjb3BlcyhTQ09QRSk7XG4gICAgaWYgKGlzQXV0aG9yaXplZCkge1xuICAgICAgICAkKCcjc2lnbi1pbi1vci1vdXQtYnV0dG9uJykuaHRtbCgnU2lnbiBvdXQnKTtcbiAgICAgICAgbGV0IHByb2ZpbGUgPSB1c2VyLmdldEJhc2ljUHJvZmlsZSgpO1xuICAgICAgICAkKCcjYXV0aC1zdGF0dXMnKS5odG1sKGBXZWxjb21lLCAke3Byb2ZpbGUuZ2V0TmFtZSgpfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5odG1sKCdTaWduIEluJyk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoJycpO1xuICAgIH1cbn1cblxuLy8gLy8gUXVpY2sgdHlwZSBmb3IgVVJMU2VhcmNoUGFyYW1zIFxuZGVjbGFyZSBjbGFzcyBHYXBpUXVldWUge1xuICAgIC8qKiBDb25zdHJ1Y3RvciByZXR1cm5pbmcgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LiAqL1xuICAgIGNvbnN0cnVjdG9yKGluaXQ/OiBzdHJpbmcpO1xuXG4gICAgLyoqIFJldHVybnMgdGhlIGZpcnN0IHZhbHVlIGFzc29jaWF0ZWQgdG8gdGhlIGdpdmVuIHNlYXJjaCBwYXJhbWV0ZXIuICovXG4gICAgZ2V0KG5hbWU6IHN0cmluZyk6IHN0cmluZztcblxuICAgIHB1c2goY2FsbGJhY2s6IGFueSk6IGFueTtcbn1cblxuIiwiJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAgICQoJyNzZXR0aW5ncycpLmNsaWNrKGhhbmRsZVNldHRpbmdzKTsgXG4gICAgJCgnI2xua19hZGRfaW1wb3J0YW50X2NoYW5nZScpLmNsaWNrKGhhbmRsZUFkZEltcG9ydGFudENoYW5nZSk7XG4gICAgJCgnI2xua19hZGRfZGljdGlvbmFyeScpLmNsaWNrKGhhbmRsZUFkZERpY3Rpb25hcnkpO1xuXG4gICAgLy9UT0RPIC0gY3JlYXRlIGluaXQgZnVuY3Rpb24gdG8gc2hvdyBzZXR0aW5ncyBpZiBub25lIGV4aXN0XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlU2V0dGluZ3MoKSB7XG4gICAgcmV0dXJuICQuZ2V0KCdzZXR0aW5ncy5odG1sJywgKGRhdGEpID0+IHtcbiAgICAgICAgYm9vdGJveC5kaWFsb2coe1xuICAgICAgICAgICAgdGl0bGU6ICdTZXR0aW5ncycsXG4gICAgICAgICAgICBtZXNzYWdlOiBkYXRhLFxuICAgICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgICAgIFwiU2F2ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0bi1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHNhdmVQYXRoc1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJDYW5jZWxcIjoge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4tZGVmYXVsdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBnZXRQYXRocygpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVBZGRJbXBvcnRhbnRDaGFuZ2UoZTogYW55KSB7XG4gICAgY29uc29sZS5sb2coZSk7XG4gICAgbGV0IHNwcmVhZHNoZWV0SWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfc3ByZWFkc2hlZXRJZCcpO1xuICAgIHZhciB1cmwgPSBlbmNvZGVVUkkoYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NwcmVhZHNoZWV0SWR9L3ZhbHVlcy9BMTA6YXBwZW5kP3ZhbHVlSW5wdXRPcHRpb249VVNFUl9FTlRFUkVEYCk7XG5cbiAgICB2YXIgdmFsdWVzID0ge1xuICAgICAgICBcInZhbHVlc1wiOiBbXG4gICAgICAgICAgICAgICAgW1widGVzdFwiLCBcImhlbGxvXCIsIFwid29ybGRcIl1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgbWFrZVJlcXVlc3QoJ1BPU1QnLCB1cmwsIEpTT04uc3RyaW5naWZ5KHZhbHVlcyksIGZ1bmN0aW9uKGVycjogYW55KSB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICBhbGVydCgnQ2hhbmdlIGV4cG9ydGVkLicpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVBZGREaWN0aW9uYXJ5KCkge1xuICAgIFxuICAgIGxldCBzcHJlYWRzaGVldElkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RpY3Rpb25hcnlfc3ByZWFkc2hlZXRJZCcpO1xuICAgIHZhciB1cmwgPSBlbmNvZGVVUkkoYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NwcmVhZHNoZWV0SWR9L3ZhbHVlcy9BMTA6YXBwZW5kP3ZhbHVlSW5wdXRPcHRpb249VVNFUl9FTlRFUkVEYCk7XG5cbiAgICB2YXIgdmFsdWVzID0ge1xuICAgICAgICBcInZhbHVlc1wiOiBbXG4gICAgICAgICAgICAgICAgW1widGVzdFwiLCBcImhlbGxvXCIsIFwid29ybGRcIl1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgbWFrZVJlcXVlc3QoJ1BPU1QnLCB1cmwsIEpTT04uc3RyaW5naWZ5KHZhbHVlcyksIGZ1bmN0aW9uKGVycjogYW55KSB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICBhbGVydCgnRGljdGlvbmFyeSBleHBvcnRlZC4nKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2F2ZVBhdGhzKCkge1xuICAgIGxldCBhbmFseXN0X3NoZWV0X3BhdGggPSAkKCcjYW5hbHlzdF9zaGVldF9wYXRoJykudmFsKCk7XG4gICAgbGV0IGltcG9ydGFudF9jaGFuZ2VzX3BhdGggPSAkKCcjaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpLnZhbCgpO1xuICAgIGxldCBkaWN0aW9uYXJ5X3BhdGggPSAkKCcjZGljdGlvbmFyeV9wYXRoJykudmFsKCk7XG5cbiAgICBsZXQgYW5hbHlzdF9zcHJlYWRzaGVldElkID0gZ2V0U3ByZWFkc2hlZXRJZChhbmFseXN0X3NoZWV0X3BhdGgpO1xuICAgIGxldCBjaGFuZ2VzX3NwcmVhZHNoZWV0SWQgPSBnZXRTcHJlYWRzaGVldElkKGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuICAgIGxldCBkaWN0aW9uYXJ5X3NwcmVhZHNoZWV0SWQgPSBnZXRTcHJlYWRzaGVldElkKGRpY3Rpb25hcnlfcGF0aCk7XG5cbiAgICBsZXQgYW5hbHlzdF93b3Jrc2hlZXRJZCA9IGdldFdvcmtzaGVldElkKGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG4gICAgbGV0IGNoYW5nZXNfd29ya3NoZWV0SWQgPSBnZXRXb3Jrc2hlZXRJZChpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcbiAgICBsZXQgZGljdGlvbmFyeV93b3Jrc2hlZXRJZCA9IGdldFdvcmtzaGVldElkKGRpY3Rpb25hcnlfcGF0aCk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYW5hbHlzdF9zaGVldF9wYXRoJywgYW5hbHlzdF9zaGVldF9wYXRoKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcsIGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkaWN0aW9uYXJ5X3BhdGgnLCBkaWN0aW9uYXJ5X3BhdGgpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FuYWx5c3Rfc3ByZWFkc2hlZXRJZCcsIGFuYWx5c3Rfc3ByZWFkc2hlZXRJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3NwcmVhZHNoZWV0SWQnLCBjaGFuZ2VzX3NwcmVhZHNoZWV0SWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkaWN0aW9uYXJ5X3NwcmVhZHNoZWV0SWQnLCBkaWN0aW9uYXJ5X3NwcmVhZHNoZWV0SWQpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FuYWx5c3Rfd29ya3NoZWV0SWQnLCBhbmFseXN0X3dvcmtzaGVldElkKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfd29ya3NoZWV0SWQnLCBjaGFuZ2VzX3dvcmtzaGVldElkKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGljdGlvbmFyeV93b3Jrc2hlZXRJZCcsIGRpY3Rpb25hcnlfd29ya3NoZWV0SWQpO1xuICAgIFxufVxuXG5mdW5jdGlvbiBnZXRQYXRocygpIHtcbiAgICBsZXQgYW5hbHlzdF9zaGVldF9wYXRoID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FuYWx5c3Rfc2hlZXRfcGF0aCcpO1xuICAgIGxldCBpbXBvcnRhbnRfY2hhbmdlc19wYXRoID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnKTtcbiAgICBsZXQgZGljdGlvbmFyeV9wYXRoID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RpY3Rpb25hcnlfcGF0aCcpO1xuXG4gICAgJCgnI2FuYWx5c3Rfc2hlZXRfcGF0aCcpLnZhbChhbmFseXN0X3NoZWV0X3BhdGgpO1xuICAgICQoJyNhbmFseXN0X3NoZWV0X3VybCcpLmF0dHIoJ2hyZWYnLCBhbmFseXN0X3NoZWV0X3BhdGgpO1xuXG4gICAgJCgnI2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnKS52YWwoaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG4gICAgJCgnI2ltcG9ydGFudF9jaGFuZ2VzX3VybCcpLmF0dHIoJ2hyZWYnLCBpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcblxuICAgICQoJyNkaWN0aW9uYXJ5X3BhdGgnKS52YWwoZGljdGlvbmFyeV9wYXRoKTtcbiAgICAkKCcjZGljdGlvbmFyeV91cmwnKS5hdHRyKCdocmVmJywgZGljdGlvbmFyeV9wYXRoKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3ByZWFkc2hlZXRJZCh1cmw6IHN0cmluZykge1xuICAgIGxldCByZSA9IG5ldyBSZWdFeHAoXCIvc3ByZWFkc2hlZXRzL2QvKFthLXpBLVowLTktX10rKVwiKTtcbiAgICBsZXQgbWF0Y2hlcyA9IHVybC5tYXRjaChyZSk7XG4gICAgcmV0dXJuIChtYXRjaGVzKSA/IG1hdGNoZXNbMV0gOiAnJztcbn1cblxuZnVuY3Rpb24gZ2V0V29ya3NoZWV0SWQodXJsOiBzdHJpbmcpIHtcbiAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKFwiWyMmXWdpZD0oWzAtOV0rKVwiKTtcbiAgICBsZXQgbWF0Y2hlcyA9IHVybC5tYXRjaChyZSk7XG4gICAgcmV0dXJuIChtYXRjaGVzKSA/IG1hdGNoZXNbMV0gOiAnJztcbn1cblxuLy9UT0RPOiBtYXliZSAtIGluc3RhbGwgbnBtIGxpYiBmb3IgZ2FwaSBhbmQgdXNlIHRoYXQgaW5zdGVhZFxuZnVuY3Rpb24gbWFrZVJlcXVlc3QobWV0aG9kOiBzdHJpbmcsIHVybDpzdHJpbmcsIGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICB2YXIgYXV0aCA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCk7XG4gIGlmICghYXV0aC5pc1NpZ25lZEluLmdldCgpKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignU2lnbmluIHJlcXVpcmVkLicpKTtcbiAgfVxuICB2YXIgYWNjZXNzVG9rZW4gPSBhdXRoLmN1cnJlbnRVc2VyLmdldCgpLmdldEF1dGhSZXNwb25zZSgpLmFjY2Vzc190b2tlbjtcbiAgJC5hamF4KHVybCwge1xuICAgIG1ldGhvZDogbWV0aG9kLFxuICAgIGRhdGE6IGRhdGEsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6ICdCZWFyZXIgJyArIGFjY2Vzc1Rva2VuLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIH0sXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IocmVzcG9uc2UucmVzcG9uc2VKU09OLm1lc3NhZ2UpKTtcbiAgICB9XG4gIH0pO1xufVxuXG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0TGlzdCgpIHtcbiAgICBsZXQgc2hlZXRJRCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhbmFseXN0X3NwcmVhZHNoZWV0SWQnKTtcbiAgICBsZXQgcmFuZ2UgPSAnQTc6QUUnO1xuXG4gICAgdmFyIHBhdGggPSBgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c2hlZXRJRH0vdmFsdWVzLyR7cmFuZ2V9YDtcbiAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcbiAgICAgICAgJ3BhdGgnOiBwYXRoLFxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiBmaXggbWUnKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlUm93KHJlY29yZDogYW55KSB7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dQYWdlKHJvd19pbmRleDogbnVtYmVyKSB7XG4gICAgLy8gbGluayB0byB0ZXN0IHNwcmVhZHNoZWV0OiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9zcHJlYWRzaGVldHMvZC8xN1FBX0MyLVhoTGVmeFpsUkt3NzRLRFkzVk5zdGJQdkszSUhXbHVESk1HUS9lZGl0I2dpZD0wXG4gICAgdmFyIHNoZWV0SUQgPSAnMTdRQV9DMi1YaExlZnhabFJLdzc0S0RZM1ZOc3RiUHZLM0lIV2x1REpNR1EnXG4gICAgdmFyIHJhbmdlID0gYEEke3Jvd19pbmRleH06QUcke3Jvd19pbmRleH1gXG5cbiAgICAvLyBJbmZvIG9uIHNwcmVhZHNoZWV0cy52YWx1ZXMuZ2V0OiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9zaGVldHMvYXBpL3JlZmVyZW5jZS9yZXN0L3Y0L3NwcmVhZHNoZWV0cy52YWx1ZXMvZ2V0XG4gICAgdmFyIHBhdGggPSBgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c2hlZXRJRH0vdmFsdWVzLyR7cmFuZ2V9YDtcbiAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcbiAgICAgICAgJ3BhdGgnOiBwYXRoLFxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgLy8gSWYgd2UgbmVlZCB0byB3cml0ZSB0byBzcHJlYWRzaGVldHM6IFxuICAgICAgICAvLyAxKSBHZXQgc3RhcnRlZDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9xdWlja3N0YXJ0L2pzXG4gICAgICAgIC8vIDIpIFJlYWQvd3JpdGUgZG9jczogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9ndWlkZXMvdmFsdWVzXG5cbiAgICAgICAgdmFyIHZhbHVlcyA9IHJlc3BvbnNlLnJlc3VsdC52YWx1ZXM7XG4gICAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciByb3dfZGF0YSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgIHZhciBvbGRfdXJsID0gcm93X2RhdGFbOF07XG4gICAgICAgICAgICB2YXIgbmV3X3VybCA9IHJvd19kYXRhWzldO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3dfZGF0YSk7XG4gICAgICAgICAgICAvLyBUT0RPOiBkZXRlcm1pbmUgaWYgb2xkIGZ1bmN0aW9uIGNhbGxzIHNob3VsZCBiZSBwbGFjZWQgaGVyZVxuICAgICAgICAgICAgLy8gc2hvd0RpZmZNZXRhZGF0YShyb3dfZGF0YSk7XG4gICAgICAgICAgICAvLyBydW5EaWZmKG9sZF91cmwsIG5ld191cmwpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcjZGlmZl90aXRsZScpLnRleHQoJ05vIGRhdGEgZm91bmQnKVxuICAgICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6ICcgKyByZXNwb25zZS5yZXN1bHQuZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVSZWNvcmQoKSB7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dNZXRhZGF0YSgpIHtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcblxufVxuXG4vLyBmdW5jdGlvbiBzZXRQYWdpbmF0aW9uKCkge1xuLy8gICAgIHZhciB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuLy8gICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHVybFBhcmFtcy5nZXQoJ2luZGV4JykpIHx8IDc7XG4vLyAgICAgJCgnI3ByZXZfaW5kZXgnKS50ZXh0KGA8LS0gUm93ICR7aW5kZXgtMX1gKS5hdHRyKCdocmVmJywgYC9kaWZmYnlpbmRleD9pbmRleD0ke2luZGV4LTF9YCk7XG4vLyAgICAgJCgnI25leHRfaW5kZXgnKS50ZXh0KGBSb3cgJHtpbmRleCsxfSAtLT5gKS5hdHRyKCdocmVmJywgYC9kaWZmYnlpbmRleD9pbmRleD0ke2luZGV4KzF9YCk7XG4vLyB9IiwiaW1wb3J0IHtnZXRMaXN0fSBmcm9tICcuL2xpc3R2aWV3LWdvb2dsZSc7XG5pbXBvcnQge2dhcGlDYWxsYmFja3N9IGZyb20gJy4vZ29vZ2xlLWF1dGgnO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBzZXR1cCBoYW5kbGVycyBcbiAgICAkKCcjbG5rX3RvZ2dsZV9zaWduaWZpZXJzJykuY2xpY2sodG9nZ2xlU2lnbmlmaWVyQWJicmV2aWF0aW9ucyk7XG4gICAgJCgnI2xua192aWV3X2xpc3QnKS5jbGljayh0b2dnbGVMaXN0Vmlldyk7IFxuICAgIGdhcGlDYWxsYmFja3MucHVzaChmdW5jdGlvbiAoKSB7XG5cdC8vIC4uIERvIHNvbWV0aGluZyB3aXRoIGdhcGksIGFzIGl0IGlzIGRlZmluZWQgYW5kIGluaXRpYWxpemVkXG4gICAgICAgIGdldExpc3QoKTsgXG4gICAgfSk7XG59KTtcblxuZnVuY3Rpb24gdG9nZ2xlTGlzdFZpZXcoKSB7XG4gICAgJCgnI2NvbnRhaW5lcl9saXN0X3ZpZXcnKS5zaG93KCk7XG4gICAgJCgnI2NvbnRhaW5lcl9wYWdlX3ZpZXcnKS5oaWRlKCk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVBhZ2VWaWV3KCkge1xuICAgICQoJyNjb250YWluZXJfbGlzdF92aWV3JykuaGlkZSgpO1xuICAgICQoJyNjb250YWluZXJfcGFnZV92aWV3Jykuc2hvdygpO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVQcm9ncmVzc2Jhcihpc1Zpc2libGU6IGJvb2xlYW4pIHtcbiAgICBpZihpc1Zpc2libGUpIHtcbiAgICAgICAgJCgnLnByb2dyZXNzJykuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJy5wcm9ncmVzcycpLmhpZGUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVNpZ25pZmllckFiYnJldmlhdGlvbnMoZTogYW55KSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5pbmZvLXRleHQnKS50b2dnbGUoKTtcbiAgICAkKCcjaW5zcGVjdG9yVmlldycpLnRvZ2dsZUNsYXNzKCdzaG9ydC12aWV3Jyk7XG59XG5cbmZ1bmN0aW9uIGdldFRhYmxlSGVhZGVyKCkge1xuICAgIHJldHVybiAkKCc8dHI+JykuYXBwZW5kKFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnSUQnKSwgXG4gICAgICAgICQoJzx0aD4nKS50ZXh0KCdPdXRwdXQgRGF0ZScpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1NpdGUnKSwgXG4gICAgICAgICQoJzx0aD4nKS50ZXh0KCdQYWdlIE5hbWUnKSwgXG4gICAgICAgICQoJzx0aD4nKS50ZXh0KCdVcmwnKSxcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1BhZ2UgVmlldyBVcmwnKSxcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ0xhc3QgVHdvJyksXG4gICAgICAgICQoJzx0aD4nKS50ZXh0KCdMYXRlc3QgdG8gQmFzZScpKTtcbn1cblxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3JlYWR5Jyk7XG59KVxuXG5mdW5jdGlvbiBsb2FkSWZyYW1lKGh0bWxfZW1iZWQ6IHN0cmluZykge1xuICAgIC8vIGluamVjdCBodG1sXG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaWZmX3ZpZXcnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzcmNkb2MnLCBodG1sX2VtYmVkKTtcblxuICAgIGlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaW5qZWN0IGRpZmYuY3NzIHRvIGhpZ2hsaWdodCA8aW5zPiBhbmQgPGRlbD4gZWxlbWVudHNcbiAgICAgICAgdmFyIGZybSA9IChmcmFtZXMgYXMgYW55KVsnZGlmZl92aWV3J10uY29udGVudERvY3VtZW50O1xuICAgICAgICB2YXIgb3RoZXJoZWFkID0gZnJtLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgIHZhciBsaW5rID0gZnJtLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdzdHlsZXNoZWV0Jyk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vY3NzL2RpZmYuY3NzYCk7XG4gICAgICAgIG90aGVyaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcblxuICAgICAgICAvLyBzZXQgaWZyYW1lIGhlaWdodCA9IGZyYW1lIGNvbnRlbnRcbiAgICAgICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywoaWZyYW1lIGFzIGFueSkuY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfTtcbn1cbiJdfQ==
