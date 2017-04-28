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
function getTableRow(record) {
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
        }
        else {
            $('#diff_title').text('No data found');
        }
    }, function (response) {
        console.error('Error: ' + response.result.error.message);
    });
}
function updateRecord() {
}
function showMetadata() {
}
function setPagination() {
}
// function setPagination() {
//     var urlParams = new URLSearchParams(window.location.search);
//     var index = parseInt(urlParams.get('index')) || 7;
//     $('#prev_index').text(`<-- Row ${index-1}`).attr('href', `/diffbyindex?index=${index-1}`);
//     $('#next_index').text(`Row ${index+1} -->`).attr('href', `/diffbyindex?index=${index+1}`);
// } 

},{}],4:[function(require,module,exports){
$(document).ready(function () {
    // setup handlers 
    $('#lnk_toggle_signifiers').click(toggleSignifierAbbreviations);
    $('#lnk_view_list').click(toggleListView);
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

},{}],5:[function(require,module,exports){
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

},{}]},{},[5,1,4,3,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtYXV0aC50cyIsInNyYy9zY3JpcHRzL2dvb2dsZS1zaGVldHMudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy1nb29nbGUudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy50cyIsInNyYy9zY3JpcHRzL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsdUVBQXVFO0FBRTNELFFBQUEsS0FBSyxHQUFHLDhDQUE4QyxDQUFDO0FBRW5FLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDZCxnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5QixlQUFlLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRUg7SUFDSSwyQ0FBMkM7SUFDM0MsdURBQXVEO0lBQ3ZELDZEQUE2RDtJQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQ7SUFDSSxzRUFBc0U7SUFDdEUsd0VBQXdFO0lBQ3hFLElBQUksWUFBWSxHQUFHLDZEQUE2RCxDQUFDO0lBRWpGLDhFQUE4RTtJQUM5RSw4Q0FBOEM7SUFDOUMsaUVBQWlFO0lBQ2pFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLFVBQVUsSUFBSTtRQUNyQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxFQUN0QixTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUUvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNiLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLGVBQWUsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUMvQixVQUFVLEVBQUUsU0FBUztZQUNyQixPQUFPLEVBQUUsYUFB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QUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBSyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sa0JBQWUsQ0FBQyxDQUFDO1FBQ3BFLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsb0NBQW9DO1FBQ3BDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQWMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRixDQUFDLENBQUM7QUFDTixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEluaXRpYWxpemVzIEdvb2dsZSBBcGlzIGFuZCBleHBvcnRzIEdvb2dsZUF1dGggb2JqZWN0IGZvciB1cyB0byB1c2UuXG5leHBvcnQgbGV0ICBHb29nbGVBdXRoOiBnYXBpLmF1dGgyLkdvb2dsZUF1dGgsXG4gICAgICAgICAgICBTQ09QRSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3NwcmVhZHNoZWV0cyc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBoYW5kbGVDbGllbnRMb2FkKCk7XG4gICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaGFuZGxlQXV0aENsaWNrKCk7XG4gICAgfSk7XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlQ2xpZW50TG9hZCgpIHtcbiAgICAvLyBMb2FkIHRoZSBBUEkncyBjbGllbnQgYW5kIGF1dGgyIG1vZHVsZXMuXG4gICAgLy8gQ2FsbCB0aGUgaW5pdENsaWVudCBmdW5jdGlvbiBhZnRlciB0aGUgbW9kdWxlcyBsb2FkLlxuICAgIC8vIGdhcGkgaXMgYSBnbG9iYWwgdmFyaWFibGUgY3JlYXRlZCBieSB0aGUgZ29vZ2xlIGFwaSBzY3JpcHRcbiAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsIGluaXRDbGllbnQpO1xufVxuXG5mdW5jdGlvbiBpbml0Q2xpZW50KCkge1xuICAgIC8vIFJldHJpZXZlIHRoZSBkaXNjb3ZlcnkgZG9jdW1lbnQgZm9yIHZlcnNpb24gNCBvZiBHb29nbGUgU2hlZXRzIEFQSS5cbiAgICAvLyBUaGlzIHdpbGwgcG9wdWxhdGUgbWV0aG9kcyBvbiBnYXBpIG9iamVjdCBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIGFwaS5cbiAgICBsZXQgZGlzY292ZXJ5VXJsID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL3NoZWV0cy92NC9yZXN0JztcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGdhcGkuY2xpZW50IG9iamVjdCwgd2hpY2ggdGhlIGFwcCB1c2VzIHRvIG1ha2UgQVBJIHJlcXVlc3RzLlxuICAgIC8vIEdldCBBUEkga2V5IGFuZCBjbGllbnQgSUQgZnJvbSBjb25maWcuanNvbi5cbiAgICAvLyAnc2NvcGUnIGZpZWxkIHNwZWNpZmllcyBzcGFjZS1kZWxpbWl0ZWQgbGlzdCBvZiBhY2Nlc3Mgc2NvcGVzLlxuICAgICQuZ2V0SlNPTignLi9jb25maWcuanNvbicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGxldCBBUElfS0VZID0gZGF0YS5BUElfS0VZLFxuICAgICAgICAgICAgQ0xJRU5UX0lEID0gZGF0YS5DTElFTlRfSUQ7XG4gICAgICAgIFxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcbiAgICAgICAgICAgICdhcGlLZXknOiBBUElfS0VZLFxuICAgICAgICAgICAgJ2Rpc2NvdmVyeURvY3MnOiBbZGlzY292ZXJ5VXJsXSxcbiAgICAgICAgICAgICdjbGllbnRJZCc6IENMSUVOVF9JRCxcbiAgICAgICAgICAgICdzY29wZSc6IFNDT1BFXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgR29vZ2xlQXV0aCA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3Igc2lnbi1pbiBzdGF0ZSBjaGFuZ2VzLlxuICAgICAgICAgICAgR29vZ2xlQXV0aC5pc1NpZ25lZEluLmxpc3Rlbih1cGRhdGVTaWduaW5TdGF0dXMpO1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgaW5pdGlhbCBzaWduLWluIHN0YXRlLiAoRGV0ZXJtaW5lIGlmIHVzZXIgaXMgYWxyZWFkeSBzaWduZWQgaW4uKVxuICAgICAgICAgICAgdXBkYXRlU2lnbmluU3RhdHVzKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAuZmFpbCgoKSA9PiBjb25zb2xlLmxvZygnQ291bGQgbm90IGxvYWQgY29uZmlnLmpzb24nKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVBdXRoQ2xpY2soKSB7XG4gICAgaWYgKEdvb2dsZUF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgICAgICAvLyBVc2VyIGlzIGF1dGhvcml6ZWQgYW5kIGhhcyBjbGlja2VkICdTaWduIG91dCcgYnV0dG9uLlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25PdXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2VyIGlzIG5vdCBzaWduZWQgaW4uIFN0YXJ0IEdvb2dsZSBhdXRoIGZsb3cuXG4gICAgICAgIEdvb2dsZUF1dGguc2lnbkluKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2b2tlQWNjZXNzKCkge1xuICAgIEdvb2dsZUF1dGguZGlzY29ubmVjdCgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTaWduaW5TdGF0dXMoaXNTaWduZWRJbjogYm9vbGVhbikge1xuICAgIGxldCB1c2VyID0gR29vZ2xlQXV0aC5jdXJyZW50VXNlci5nZXQoKTtcbiAgICBsZXQgaXNBdXRob3JpemVkID0gdXNlci5oYXNHcmFudGVkU2NvcGVzKFNDT1BFKTtcbiAgICBpZiAoaXNBdXRob3JpemVkKSB7XG4gICAgICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5odG1sKCdTaWduIG91dCcpO1xuICAgICAgICBsZXQgcHJvZmlsZSA9IHVzZXIuZ2V0QmFzaWNQcm9maWxlKCk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoYFdlbGNvbWUsICR7cHJvZmlsZS5nZXROYW1lKCl9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gSW4nKTtcbiAgICAgICAgJCgnI2F1dGgtc3RhdHVzJykuaHRtbCgnJyk7XG4gICAgfVxufVxuXG4iLCIkKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgJCgnI3NldHRpbmdzJykuY2xpY2soaGFuZGxlU2V0dGluZ3MpOyBcbiAgICAkKCcjbG5rX2FkZF9pbXBvcnRhbnRfY2hhbmdlJykuY2xpY2soaGFuZGxlQWRkSW1wb3J0YW50Q2hhbmdlKTtcbiAgICAkKCcjbG5rX2FkZF9kaWN0aW9uYXJ5JykuY2xpY2soaGFuZGxlQWRkRGljdGlvbmFyeSk7XG5cbiAgICAvL1RPRE8gLSBjcmVhdGUgaW5pdCBmdW5jdGlvbiB0byBzaG93IHNldHRpbmdzIGlmIG5vbmUgZXhpc3Rcbn0pO1xuXG5mdW5jdGlvbiBoYW5kbGVTZXR0aW5ncygpIHtcbiAgICByZXR1cm4gJC5nZXQoJ3NldHRpbmdzLmh0bWwnLCAoZGF0YSkgPT4ge1xuICAgICAgICBib290Ym94LmRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZTogJ1NldHRpbmdzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGRhdGEsXG4gICAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAgICAgXCJTYXZlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYnRuLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogc2F2ZVBhdGhzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIkNhbmNlbFwiOiB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0bi1kZWZhdWx0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGdldFBhdGhzKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUFkZEltcG9ydGFudENoYW5nZShlOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhlKTtcbiAgICBsZXQgc3ByZWFkc2hlZXRJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19zcHJlYWRzaGVldElkJyk7XG4gICAgdmFyIHVybCA9IGVuY29kZVVSSShgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c3ByZWFkc2hlZXRJZH0vdmFsdWVzL0ExMDphcHBlbmQ/dmFsdWVJbnB1dE9wdGlvbj1VU0VSX0VOVEVSRURgKTtcblxuICAgIHZhciB2YWx1ZXMgPSB7XG4gICAgICAgIFwidmFsdWVzXCI6IFtcbiAgICAgICAgICAgICAgICBbXCJ0ZXN0XCIsIFwiaGVsbG9cIiwgXCJ3b3JsZFwiXVxuICAgICAgICAgICAgXVxuICAgICAgICB9XG5cbiAgICBtYWtlUmVxdWVzdCgnUE9TVCcsIHVybCwgSlNPTi5zdHJpbmdpZnkodmFsdWVzKSwgZnVuY3Rpb24oZXJyOiBhbnkpIHtcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGFsZXJ0KCdDaGFuZ2UgZXhwb3J0ZWQuJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUFkZERpY3Rpb25hcnkoKSB7XG4gICAgXG4gICAgbGV0IHNwcmVhZHNoZWV0SWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGljdGlvbmFyeV9zcHJlYWRzaGVldElkJyk7XG4gICAgdmFyIHVybCA9IGVuY29kZVVSSShgaHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLyR7c3ByZWFkc2hlZXRJZH0vdmFsdWVzL0ExMDphcHBlbmQ/dmFsdWVJbnB1dE9wdGlvbj1VU0VSX0VOVEVSRURgKTtcblxuICAgIHZhciB2YWx1ZXMgPSB7XG4gICAgICAgIFwidmFsdWVzXCI6IFtcbiAgICAgICAgICAgICAgICBbXCJ0ZXN0XCIsIFwiaGVsbG9cIiwgXCJ3b3JsZFwiXVxuICAgICAgICAgICAgXVxuICAgICAgICB9XG5cbiAgICBtYWtlUmVxdWVzdCgnUE9TVCcsIHVybCwgSlNPTi5zdHJpbmdpZnkodmFsdWVzKSwgZnVuY3Rpb24oZXJyOiBhbnkpIHtcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGFsZXJ0KCdEaWN0aW9uYXJ5IGV4cG9ydGVkLicpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzYXZlUGF0aHMoKSB7XG4gICAgbGV0IGFuYWx5c3Rfc2hlZXRfcGF0aCA9ICQoJyNhbmFseXN0X3NoZWV0X3BhdGgnKS52YWwoKTtcbiAgICBsZXQgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCA9ICQoJyNpbXBvcnRhbnRfY2hhbmdlc19wYXRoJykudmFsKCk7XG4gICAgbGV0IGRpY3Rpb25hcnlfcGF0aCA9ICQoJyNkaWN0aW9uYXJ5X3BhdGgnKS52YWwoKTtcblxuICAgIGxldCBhbmFseXN0X3NwcmVhZHNoZWV0SWQgPSBnZXRTcHJlYWRzaGVldElkKGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG4gICAgbGV0IGNoYW5nZXNfc3ByZWFkc2hlZXRJZCA9IGdldFNwcmVhZHNoZWV0SWQoaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG4gICAgbGV0IGRpY3Rpb25hcnlfc3ByZWFkc2hlZXRJZCA9IGdldFNwcmVhZHNoZWV0SWQoZGljdGlvbmFyeV9wYXRoKTtcblxuICAgIGxldCBhbmFseXN0X3dvcmtzaGVldElkID0gZ2V0V29ya3NoZWV0SWQoYW5hbHlzdF9zaGVldF9wYXRoKTtcbiAgICBsZXQgY2hhbmdlc193b3Jrc2hlZXRJZCA9IGdldFdvcmtzaGVldElkKGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuICAgIGxldCBkaWN0aW9uYXJ5X3dvcmtzaGVldElkID0gZ2V0V29ya3NoZWV0SWQoZGljdGlvbmFyeV9wYXRoKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhbmFseXN0X3NoZWV0X3BhdGgnLCBhbmFseXN0X3NoZWV0X3BhdGgpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19wYXRoJywgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RpY3Rpb25hcnlfcGF0aCcsIGRpY3Rpb25hcnlfcGF0aCk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYW5hbHlzdF9zcHJlYWRzaGVldElkJywgYW5hbHlzdF9zcHJlYWRzaGVldElkKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfc3ByZWFkc2hlZXRJZCcsIGNoYW5nZXNfc3ByZWFkc2hlZXRJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RpY3Rpb25hcnlfc3ByZWFkc2hlZXRJZCcsIGRpY3Rpb25hcnlfc3ByZWFkc2hlZXRJZCk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYW5hbHlzdF93b3Jrc2hlZXRJZCcsIGFuYWx5c3Rfd29ya3NoZWV0SWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc193b3Jrc2hlZXRJZCcsIGNoYW5nZXNfd29ya3NoZWV0SWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkaWN0aW9uYXJ5X3dvcmtzaGVldElkJywgZGljdGlvbmFyeV93b3Jrc2hlZXRJZCk7XG4gICAgXG59XG5cbmZ1bmN0aW9uIGdldFBhdGhzKCkge1xuICAgIGxldCBhbmFseXN0X3NoZWV0X3BhdGggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYW5hbHlzdF9zaGVldF9wYXRoJyk7XG4gICAgbGV0IGltcG9ydGFudF9jaGFuZ2VzX3BhdGggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpO1xuICAgIGxldCBkaWN0aW9uYXJ5X3BhdGggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGljdGlvbmFyeV9wYXRoJyk7XG5cbiAgICAkKCcjYW5hbHlzdF9zaGVldF9wYXRoJykudmFsKGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG4gICAgJCgnI2FuYWx5c3Rfc2hlZXRfdXJsJykuYXR0cignaHJlZicsIGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG5cbiAgICAkKCcjaW1wb3J0YW50X2NoYW5nZXNfcGF0aCcpLnZhbChpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcbiAgICAkKCcjaW1wb3J0YW50X2NoYW5nZXNfdXJsJykuYXR0cignaHJlZicsIGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuXG4gICAgJCgnI2RpY3Rpb25hcnlfcGF0aCcpLnZhbChkaWN0aW9uYXJ5X3BhdGgpO1xuICAgICQoJyNkaWN0aW9uYXJ5X3VybCcpLmF0dHIoJ2hyZWYnLCBkaWN0aW9uYXJ5X3BhdGgpO1xufVxuXG5mdW5jdGlvbiBnZXRTcHJlYWRzaGVldElkKHVybDogc3RyaW5nKSB7XG4gICAgbGV0IHJlID0gbmV3IFJlZ0V4cChcIi9zcHJlYWRzaGVldHMvZC8oW2EtekEtWjAtOS1fXSspXCIpO1xuICAgIGxldCBtYXRjaGVzID0gdXJsLm1hdGNoKHJlKTtcbiAgICByZXR1cm4gKG1hdGNoZXMpID8gbWF0Y2hlc1sxXSA6ICcnO1xufVxuXG5mdW5jdGlvbiBnZXRXb3Jrc2hlZXRJZCh1cmw6IHN0cmluZykge1xuICAgIGxldCByZSA9IG5ldyBSZWdFeHAoXCJbIyZdZ2lkPShbMC05XSspXCIpO1xuICAgIGxldCBtYXRjaGVzID0gdXJsLm1hdGNoKHJlKTtcbiAgICByZXR1cm4gKG1hdGNoZXMpID8gbWF0Y2hlc1sxXSA6ICcnO1xufVxuXG4vL1RPRE86IG1heWJlIC0gaW5zdGFsbCBucG0gbGliIGZvciBnYXBpIGFuZCB1c2UgdGhhdCBpbnN0ZWFkXG5mdW5jdGlvbiBtYWtlUmVxdWVzdChtZXRob2Q6IHN0cmluZywgdXJsOnN0cmluZywgZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gIHZhciBhdXRoID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKTtcbiAgaWYgKCFhdXRoLmlzU2lnbmVkSW4uZ2V0KCkpIHtcbiAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdTaWduaW4gcmVxdWlyZWQuJykpO1xuICB9XG4gIHZhciBhY2Nlc3NUb2tlbiA9IGF1dGguY3VycmVudFVzZXIuZ2V0KCkuZ2V0QXV0aFJlc3BvbnNlKCkuYWNjZXNzX3Rva2VuO1xuICAkLmFqYXgodXJsLCB7XG4gICAgbWV0aG9kOiBtZXRob2QsXG4gICAgZGF0YTogZGF0YSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgYWNjZXNzVG9rZW4sXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihyZXNwb25zZS5yZXNwb25zZUpTT04ubWVzc2FnZSkpO1xuICAgIH1cbiAgfSk7XG59XG5cbiIsImZ1bmN0aW9uIGdldFRhYmxlUm93KHJlY29yZDogYW55KSB7XG5cbn1cblxuZnVuY3Rpb24gc2hvd1BhZ2Uocm93X2luZGV4OiBudW1iZXIpIHtcbiAgICAvLyBsaW5rIHRvIHRlc3Qgc3ByZWFkc2hlZXQ6IGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL3NwcmVhZHNoZWV0cy9kLzE3UUFfQzItWGhMZWZ4WmxSS3c3NEtEWTNWTnN0YlB2SzNJSFdsdURKTUdRL2VkaXQjZ2lkPTBcbiAgICB2YXIgc2hlZXRJRCA9ICcxN1FBX0MyLVhoTGVmeFpsUkt3NzRLRFkzVk5zdGJQdkszSUhXbHVESk1HUSdcbiAgICB2YXIgcmFuZ2UgPSBgQSR7cm93X2luZGV4fTpBRyR7cm93X2luZGV4fWBcblxuICAgIC8vIEluZm8gb24gc3ByZWFkc2hlZXRzLnZhbHVlcy5nZXQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcmVmZXJlbmNlL3Jlc3QvdjQvc3ByZWFkc2hlZXRzLnZhbHVlcy9nZXRcbiAgICB2YXIgcGF0aCA9IGBodHRwczovL3NoZWV0cy5nb29nbGVhcGlzLmNvbS92NC9zcHJlYWRzaGVldHMvJHtzaGVldElEfS92YWx1ZXMvJHtyYW5nZX1gO1xuICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xuICAgICAgICAncGF0aCc6IHBhdGgsXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xuICAgICAgICAvLyBJZiB3ZSBuZWVkIHRvIHdyaXRlIHRvIHNwcmVhZHNoZWV0czogXG4gICAgICAgIC8vIDEpIEdldCBzdGFydGVkOiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9zaGVldHMvYXBpL3F1aWNrc3RhcnQvanNcbiAgICAgICAgLy8gMikgUmVhZC93cml0ZSBkb2NzOiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9zaGVldHMvYXBpL2d1aWRlcy92YWx1ZXNcblxuICAgICAgICB2YXIgdmFsdWVzID0gcmVzcG9uc2UucmVzdWx0LnZhbHVlcztcbiAgICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIHJvd19kYXRhID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgdmFyIG9sZF91cmwgPSByb3dfZGF0YVs4XTtcbiAgICAgICAgICAgIHZhciBuZXdfdXJsID0gcm93X2RhdGFbOV07XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJvd19kYXRhKTtcbiAgICAgICAgICAgIC8vIFRPRE86IGRldGVybWluZSBpZiBvbGQgZnVuY3Rpb24gY2FsbHMgc2hvdWxkIGJlIHBsYWNlZCBoZXJlXG4gICAgICAgICAgICAvLyBzaG93RGlmZk1ldGFkYXRhKHJvd19kYXRhKTtcbiAgICAgICAgICAgIC8vIHJ1bkRpZmYob2xkX3VybCwgbmV3X3VybCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJyNkaWZmX3RpdGxlJykudGV4dCgnTm8gZGF0YSBmb3VuZCcpXG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvcjogJyArIHJlc3BvbnNlLnJlc3VsdC5lcnJvci5tZXNzYWdlKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVjb3JkKCkge1xuXG59XG5cbmZ1bmN0aW9uIHNob3dNZXRhZGF0YSgpIHtcblxufVxuXG5mdW5jdGlvbiBzZXRQYWdpbmF0aW9uKCkge1xuXG59XG5cbi8vIGZ1bmN0aW9uIHNldFBhZ2luYXRpb24oKSB7XG4vLyAgICAgdmFyIHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4vLyAgICAgdmFyIGluZGV4ID0gcGFyc2VJbnQodXJsUGFyYW1zLmdldCgnaW5kZXgnKSkgfHwgNztcbi8vICAgICAkKCcjcHJldl9pbmRleCcpLnRleHQoYDwtLSBSb3cgJHtpbmRleC0xfWApLmF0dHIoJ2hyZWYnLCBgL2RpZmZieWluZGV4P2luZGV4PSR7aW5kZXgtMX1gKTtcbi8vICAgICAkKCcjbmV4dF9pbmRleCcpLnRleHQoYFJvdyAke2luZGV4KzF9IC0tPmApLmF0dHIoJ2hyZWYnLCBgL2RpZmZieWluZGV4P2luZGV4PSR7aW5kZXgrMX1gKTtcbi8vIH0iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBzZXR1cCBoYW5kbGVycyBcbiAgICAkKCcjbG5rX3RvZ2dsZV9zaWduaWZpZXJzJykuY2xpY2sodG9nZ2xlU2lnbmlmaWVyQWJicmV2aWF0aW9ucyk7XG4gICAgJCgnI2xua192aWV3X2xpc3QnKS5jbGljayh0b2dnbGVMaXN0Vmlldyk7ICBcbn0pO1xuXG5mdW5jdGlvbiB0b2dnbGVMaXN0VmlldygpIHtcbiAgICAkKCcjY29udGFpbmVyX2xpc3RfdmlldycpLnNob3coKTtcbiAgICAkKCcjY29udGFpbmVyX3BhZ2VfdmlldycpLmhpZGUoKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlUGFnZVZpZXcoKSB7XG4gICAgJCgnI2NvbnRhaW5lcl9saXN0X3ZpZXcnKS5oaWRlKCk7XG4gICAgJCgnI2NvbnRhaW5lcl9wYWdlX3ZpZXcnKS5zaG93KCk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVByb2dyZXNzYmFyKGlzVmlzaWJsZTogYm9vbGVhbikge1xuICAgIGlmKGlzVmlzaWJsZSkge1xuICAgICAgICAkKCcucHJvZ3Jlc3MnKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnLnByb2dyZXNzJykuaGlkZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlU2lnbmlmaWVyQWJicmV2aWF0aW9ucyhlOiBhbnkpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmluZm8tdGV4dCcpLnRvZ2dsZSgpO1xuICAgICQoJyNpbnNwZWN0b3JWaWV3JykudG9nZ2xlQ2xhc3MoJ3Nob3J0LXZpZXcnKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGFibGVIZWFkZXIoKSB7XG4gICAgcmV0dXJuICQoJzx0cj4nKS5hcHBlbmQoXG4gICAgICAgICQoJzx0aD4nKS50ZXh0KCdJRCcpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ091dHB1dCBEYXRlJyksIFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnU2l0ZScpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1BhZ2UgTmFtZScpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1VybCcpLFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnUGFnZSBWaWV3IFVybCcpLFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnTGFzdCBUd28nKSxcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ0xhdGVzdCB0byBCYXNlJykpO1xufSIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZWFkeScpO1xufSlcblxuZnVuY3Rpb24gbG9hZElmcmFtZShodG1sX2VtYmVkOiBzdHJpbmcpIHtcbiAgICAvLyBpbmplY3QgaHRtbFxuICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlmZl92aWV3Jyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjZG9jJywgaHRtbF9lbWJlZCk7XG5cbiAgICBpZnJhbWUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGluamVjdCBkaWZmLmNzcyB0byBoaWdobGlnaHQgPGlucz4gYW5kIDxkZWw+IGVsZW1lbnRzXG4gICAgICAgIHZhciBmcm0gPSAoZnJhbWVzIGFzIGFueSlbJ2RpZmZfdmlldyddLmNvbnRlbnREb2N1bWVudDtcbiAgICAgICAgdmFyIG90aGVyaGVhZCA9IGZybS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICB2YXIgbGluayA9IGZybS5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdyZWwnLCAnc3R5bGVzaGVldCcpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59L2Nzcy9kaWZmLmNzc2ApO1xuICAgICAgICBvdGhlcmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG5cbiAgICAgICAgLy8gc2V0IGlmcmFtZSBoZWlnaHQgPSBmcmFtZSBjb250ZW50XG4gICAgICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsKGlmcmFtZSBhcyBhbnkpLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQpO1xuICAgIH07XG59XG4iXX0=
