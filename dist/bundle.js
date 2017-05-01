(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
// Initializes Google Apis and exports GoogleAuth object for us to use.
exports.SCOPE = 'https://www.googleapis.com/auth/spreadsheets', exports.gapiCallbacks = [];
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
// creates queue that we can push calls to global gapi object
// that will allow us to wait for gapi to be loaded before
// calls are made
function gapiLoaded() {
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
// // Quick type for GapiQueue 
var GapiQueue = (function () {
    function GapiQueue() {
        this.push = function (callback) {
            setTimeout(callback, 0);
        };
    }
    ;
    return GapiQueue;
}());

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
    return new Promise(function (resolve, reject) {
        gapi.client.request({
            'path': path,
        }).then(function (response) {
            resolve(response.result.values);
        }, function (response) {
            reject(Error('Didn\'t get values'));
        });
    });
}
exports.getList = getList;
function getTableRow(record) {
    var index = record[0];
    var updated_at = record[2];
    var site = record[4];
    var title = record[5];
    var url = record[6];
    var versionista_url = record[7];
    var diff_with_previous_url = record[8];
    var diff_with_first_url = record[9] || '';
    var row = $('<tr>').attr('id', "row_record_" + index).append($('<td>').text(index), $('<td>').text(updated_at), $('<td>').text(site), $('<td>').text(title), $('<td>').html("<a href=\"https://" + url + "\" target=\"_blank\" rel=\"noopener\">" + url.substr(0, 20) + "...</a>"), $('<td>').html("<a href=\"" + versionista_url + "\" target=\"_blank\" rel=\"noopener\">" + versionista_url.substr(-15) + "</a>"), $('<td>').html("<a href=\"" + diff_with_previous_url + "\" target=\"_blank\" rel=\"noopener\">" + diff_with_previous_url.substr(-15) + "</a>"), $('<td>').html("<a href=\"" + diff_with_first_url + "\" target=\"_blank\" rel=\"noopener\">" + diff_with_first_url.substr(-15) + "</a>"));
    row.click(function () {
        showPage(parseInt(row.data('row_index'), 10));
        // setPagination(row.data('prev_record'), row.data('next_record'));
    });
    return row;
}
exports.getTableRow = getTableRow;
function showPage(row_index) {
    var sheetID = localStorage.getItem('analyst_spreadsheetId');
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
var google_auth_1 = require("./google-auth");
var list_google = require("./listview-google");
$(document).ready(function () {
    // setup handlers 
    $('#lnk_toggle_signifiers').click(toggleSignifierAbbreviations);
    $('#lnk_view_list').click(toggleListView);
    //TODO - understand how this magic works!
    // https://advancedweb.hu/2015/05/12/using-google-auth-in-javascript/
    // http://mrcoles.com/blog/google-analytics-asynchronous-tracking-how-it-work/
    google_auth_1.gapiCallbacks.push(function () {
        list_google.getList().then(function (response) {
            var records = response;
            var table = $('#tbl_list_view');
            var diff = $('#diff_view');
            table.find('thead').append(getTableHeader());
            var tbody = table.find('tbody');
            var totalRecordLength = 31;
            var data_start_index = 7;
            records.forEach(function (record, index, records) {
                // gapi will not return empty columns, so we have to pad them 
                if (record.length < totalRecordLength) {
                    var i = totalRecordLength - record.length;
                    while (i-- > 0)
                        record.push("");
                }
                var row = list_google.getTableRow(record);
                row.data('row_index', index + data_start_index);
                // row.data('prev_record', records[index-1]);
                // row.data('next_record', records[index+1]);
                tbody.append(row);
            });
            toggleProgressbar(false);
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtYXV0aC50cyIsInNyYy9zY3JpcHRzL2dvb2dsZS1zaGVldHMudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy1nb29nbGUudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy50cyIsInNyYy9zY3JpcHRzL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsdUVBQXVFO0FBRTNELFFBQUEsS0FBSyxHQUFHLDhDQUE4QyxFQUN0RCxRQUFBLGFBQWEsR0FBUSxFQUFFLENBQUM7QUFFcEMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNkLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlCLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7QUFFSDtJQUNJLDJDQUEyQztJQUMzQyx1REFBdUQ7SUFDdkQsNkRBQTZEO0lBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRDtJQUNJLHNFQUFzRTtJQUN0RSx3RUFBd0U7SUFDeEUsSUFBSSxZQUFZLEdBQUcsNkRBQTZELENBQUM7SUFFakYsOEVBQThFO0lBQzlFLDhDQUE4QztJQUM5QyxpRUFBaUU7SUFDakUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsVUFBVSxJQUFJO1FBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQ3RCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRS9CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsUUFBUSxFQUFFLE9BQU87WUFDakIsZUFBZSxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQy9CLFVBQVUsRUFB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b3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBJbml0aWFsaXplcyBHb29nbGUgQXBpcyBhbmQgZXhwb3J0cyBHb29nbGVBdXRoIG9iamVjdCBmb3IgdXMgdG8gdXNlLlxuZXhwb3J0IGxldCAgR29vZ2xlQXV0aDogZ2FwaS5hdXRoMi5Hb29nbGVBdXRoLFxuICAgICAgICAgICAgU0NPUEUgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9zcHJlYWRzaGVldHMnLFxuICAgICAgICAgICAgZ2FwaUNhbGxiYWNrczogYW55ID0gW107XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBoYW5kbGVDbGllbnRMb2FkKCk7XG4gICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaGFuZGxlQXV0aENsaWNrKCk7XG4gICAgfSk7XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlQ2xpZW50TG9hZCgpIHtcbiAgICAvLyBMb2FkIHRoZSBBUEkncyBjbGllbnQgYW5kIGF1dGgyIG1vZHVsZXMuXG4gICAgLy8gQ2FsbCB0aGUgaW5pdENsaWVudCBmdW5jdGlvbiBhZnRlciB0aGUgbW9kdWxlcyBsb2FkLlxuICAgIC8vIGdhcGkgaXMgYSBnbG9iYWwgdmFyaWFibGUgY3JlYXRlZCBieSB0aGUgZ29vZ2xlIGFwaSBzY3JpcHRcbiAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsIGluaXRDbGllbnQpO1xufVxuXG5mdW5jdGlvbiBpbml0Q2xpZW50KCkge1xuICAgIC8vIFJldHJpZXZlIHRoZSBkaXNjb3ZlcnkgZG9jdW1lbnQgZm9yIHZlcnNpb24gNCBvZiBHb29nbGUgU2hlZXRzIEFQSS5cbiAgICAvLyBUaGlzIHdpbGwgcG9wdWxhdGUgbWV0aG9kcyBvbiBnYXBpIG9iamVjdCBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIGFwaS5cbiAgICBsZXQgZGlzY292ZXJ5VXJsID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL3NoZWV0cy92NC9yZXN0JztcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGdhcGkuY2xpZW50IG9iamVjdCwgd2hpY2ggdGhlIGFwcCB1c2VzIHRvIG1ha2UgQVBJIHJlcXVlc3RzLlxuICAgIC8vIEdldCBBUEkga2V5IGFuZCBjbGllbnQgSUQgZnJvbSBjb25maWcuanNvbi5cbiAgICAvLyAnc2NvcGUnIGZpZWxkIHNwZWNpZmllcyBzcGFjZS1kZWxpbWl0ZWQgbGlzdCBvZiBhY2Nlc3Mgc2NvcGVzLlxuICAgICQuZ2V0SlNPTignLi9jb25maWcuanNvbicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGxldCBBUElfS0VZID0gZGF0YS5BUElfS0VZLFxuICAgICAgICAgICAgQ0xJRU5UX0lEID0gZGF0YS5DTElFTlRfSUQ7XG4gICAgICAgIFxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcbiAgICAgICAgICAgICdhcGlLZXknOiBBUElfS0VZLFxuICAgICAgICAgICAgJ2Rpc2NvdmVyeURvY3MnOiBbZGlzY292ZXJ5VXJsXSxcbiAgICAgICAgICAgICdjbGllbnRJZCc6IENMSUVOVF9JRCxcbiAgICAgICAgICAgICdzY29wZSc6IFNDT1BFXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgR29vZ2xlQXV0aCA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3Igc2lnbi1pbiBzdGF0ZSBjaGFuZ2VzLlxuICAgICAgICAgICAgR29vZ2xlQXV0aC5pc1NpZ25lZEluLmxpc3Rlbih1cGRhdGVTaWduaW5TdGF0dXMpO1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgaW5pdGlhbCBzaWduLWluIHN0YXRlLiAoRGV0ZXJtaW5lIGlmIHVzZXIgaXMgYWxyZWFkeSBzaWduZWQgaW4uKVxuICAgICAgICAgICAgdXBkYXRlU2lnbmluU3RhdHVzKGZhbHNlKTtcbiAgICAgICAgfSkudGhlbihnYXBpTG9hZGVkKTtcbiAgICB9KVxuICAgIC5mYWlsKCgpID0+IGNvbnNvbGUubG9nKCdDb3VsZCBub3QgbG9hZCBjb25maWcuanNvbicpKTtcbn1cblxuLy8gY3JlYXRlcyBxdWV1ZSB0aGF0IHdlIGNhbiBwdXNoIGNhbGxzIHRvIGdsb2JhbCBnYXBpIG9iamVjdFxuLy8gdGhhdCB3aWxsIGFsbG93IHVzIHRvIHdhaXQgZm9yIGdhcGkgdG8gYmUgbG9hZGVkIGJlZm9yZVxuLy8gY2FsbHMgYXJlIG1hZGVcbmZ1bmN0aW9uIGdhcGlMb2FkZWQoKXtcbiAgICBsZXQgX29sZF9nYXBpQ2FsbGJhY2tzID0gZ2FwaUNhbGxiYWNrcztcbiAgICBnYXBpQ2FsbGJhY2tzID0gbmV3IEdhcGlRdWV1ZSgpO1xuICAgIF9vbGRfZ2FwaUNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGdhcGlDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVBdXRoQ2xpY2soKSB7XG4gICAgaWYgKEdvb2dsZUF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgICAgICAvLyBVc2VyIGlzIGF1dGhvcml6ZWQgYW5kIGhhcyBjbGlja2VkICdTaWduIG91dCcgYnV0dG9uLlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25PdXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2VyIGlzIG5vdCBzaWduZWQgaW4uIFN0YXJ0IEdvb2dsZSBhdXRoIGZsb3cuXG4gICAgICAgIEdvb2dsZUF1dGguc2lnbkluKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2b2tlQWNjZXNzKCkge1xuICAgIEdvb2dsZUF1dGguZGlzY29ubmVjdCgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTaWduaW5TdGF0dXMoaXNTaWduZWRJbjogYm9vbGVhbikge1xuICAgIGxldCB1c2VyID0gR29vZ2xlQXV0aC5jdXJyZW50VXNlci5nZXQoKTtcbiAgICBsZXQgaXNBdXRob3JpemVkID0gdXNlci5oYXNHcmFudGVkU2NvcGVzKFNDT1BFKTtcbiAgICBpZiAoaXNBdXRob3JpemVkKSB7XG4gICAgICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5odG1sKCdTaWduIG91dCcpO1xuICAgICAgICBsZXQgcHJvZmlsZSA9IHVzZXIuZ2V0QmFzaWNQcm9maWxlKCk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoYFdlbGNvbWUsICR7cHJvZmlsZS5nZXROYW1lKCl9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gSW4nKTtcbiAgICAgICAgJCgnI2F1dGgtc3RhdHVzJykuaHRtbCgnJyk7XG4gICAgfVxufVxuXG4vLyAvLyBRdWljayB0eXBlIGZvciBHYXBpUXVldWUgXG5jbGFzcyBHYXBpUXVldWUge1xuICAgIHB1c2g6IGFueTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wdXNoID0gZnVuY3Rpb24gKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIDApO1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbiIsIiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICAkKCcjc2V0dGluZ3MnKS5jbGljayhoYW5kbGVTZXR0aW5ncyk7IFxuICAgICQoJyNsbmtfYWRkX2ltcG9ydGFudF9jaGFuZ2UnKS5jbGljayhoYW5kbGVBZGRJbXBvcnRhbnRDaGFuZ2UpO1xuICAgICQoJyNsbmtfYWRkX2RpY3Rpb25hcnknKS5jbGljayhoYW5kbGVBZGREaWN0aW9uYXJ5KTtcblxuICAgIC8vVE9ETyAtIGNyZWF0ZSBpbml0IGZ1bmN0aW9uIHRvIHNob3cgc2V0dGluZ3MgaWYgbm9uZSBleGlzdFxufSk7XG5cbmZ1bmN0aW9uIGhhbmRsZVNldHRpbmdzKCkge1xuICAgIHJldHVybiAkLmdldCgnc2V0dGluZ3MuaHRtbCcsIChkYXRhKSA9PiB7XG4gICAgICAgIGJvb3Rib3guZGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlOiAnU2V0dGluZ3MnLFxuICAgICAgICAgICAgbWVzc2FnZTogZGF0YSxcbiAgICAgICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAgICAgICBcIlNhdmVcIjoge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4tc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBzYXZlUGF0aHNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiQ2FuY2VsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYnRuLWRlZmF1bHQnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZ2V0UGF0aHMoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQWRkSW1wb3J0YW50Q2hhbmdlKGU6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIGxldCBzcHJlYWRzaGVldElkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3NwcmVhZHNoZWV0SWQnKTtcbiAgICB2YXIgdXJsID0gZW5jb2RlVVJJKGBodHRwczovL3NoZWV0cy5nb29nbGVhcGlzLmNvbS92NC9zcHJlYWRzaGVldHMvJHtzcHJlYWRzaGVldElkfS92YWx1ZXMvQTEwOmFwcGVuZD92YWx1ZUlucHV0T3B0aW9uPVVTRVJfRU5URVJFRGApO1xuXG4gICAgdmFyIHZhbHVlcyA9IHtcbiAgICAgICAgXCJ2YWx1ZXNcIjogW1xuICAgICAgICAgICAgICAgIFtcInRlc3RcIiwgXCJoZWxsb1wiLCBcIndvcmxkXCJdXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgIG1ha2VSZXF1ZXN0KCdQT1NUJywgdXJsLCBKU09OLnN0cmluZ2lmeSh2YWx1ZXMpLCBmdW5jdGlvbihlcnI6IGFueSkge1xuICAgICAgICBpZiAoZXJyKSByZXR1cm4gY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgYWxlcnQoJ0NoYW5nZSBleHBvcnRlZC4nKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQWRkRGljdGlvbmFyeSgpIHtcbiAgICBcbiAgICBsZXQgc3ByZWFkc2hlZXRJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkaWN0aW9uYXJ5X3NwcmVhZHNoZWV0SWQnKTtcbiAgICB2YXIgdXJsID0gZW5jb2RlVVJJKGBodHRwczovL3NoZWV0cy5nb29nbGVhcGlzLmNvbS92NC9zcHJlYWRzaGVldHMvJHtzcHJlYWRzaGVldElkfS92YWx1ZXMvQTEwOmFwcGVuZD92YWx1ZUlucHV0T3B0aW9uPVVTRVJfRU5URVJFRGApO1xuXG4gICAgdmFyIHZhbHVlcyA9IHtcbiAgICAgICAgXCJ2YWx1ZXNcIjogW1xuICAgICAgICAgICAgICAgIFtcInRlc3RcIiwgXCJoZWxsb1wiLCBcIndvcmxkXCJdXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgIG1ha2VSZXF1ZXN0KCdQT1NUJywgdXJsLCBKU09OLnN0cmluZ2lmeSh2YWx1ZXMpLCBmdW5jdGlvbihlcnI6IGFueSkge1xuICAgICAgICBpZiAoZXJyKSByZXR1cm4gY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgYWxlcnQoJ0RpY3Rpb25hcnkgZXhwb3J0ZWQuJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVQYXRocygpIHtcbiAgICBsZXQgYW5hbHlzdF9zaGVldF9wYXRoID0gJCgnI2FuYWx5c3Rfc2hlZXRfcGF0aCcpLnZhbCgpO1xuICAgIGxldCBpbXBvcnRhbnRfY2hhbmdlc19wYXRoID0gJCgnI2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnKS52YWwoKTtcbiAgICBsZXQgZGljdGlvbmFyeV9wYXRoID0gJCgnI2RpY3Rpb25hcnlfcGF0aCcpLnZhbCgpO1xuXG4gICAgbGV0IGFuYWx5c3Rfc3ByZWFkc2hlZXRJZCA9IGdldFNwcmVhZHNoZWV0SWQoYW5hbHlzdF9zaGVldF9wYXRoKTtcbiAgICBsZXQgY2hhbmdlc19zcHJlYWRzaGVldElkID0gZ2V0U3ByZWFkc2hlZXRJZChpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcbiAgICBsZXQgZGljdGlvbmFyeV9zcHJlYWRzaGVldElkID0gZ2V0U3ByZWFkc2hlZXRJZChkaWN0aW9uYXJ5X3BhdGgpO1xuXG4gICAgbGV0IGFuYWx5c3Rfd29ya3NoZWV0SWQgPSBnZXRXb3Jrc2hlZXRJZChhbmFseXN0X3NoZWV0X3BhdGgpO1xuICAgIGxldCBjaGFuZ2VzX3dvcmtzaGVldElkID0gZ2V0V29ya3NoZWV0SWQoaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG4gICAgbGV0IGRpY3Rpb25hcnlfd29ya3NoZWV0SWQgPSBnZXRXb3Jrc2hlZXRJZChkaWN0aW9uYXJ5X3BhdGgpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FuYWx5c3Rfc2hlZXRfcGF0aCcsIGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnLCBpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGljdGlvbmFyeV9wYXRoJywgZGljdGlvbmFyeV9wYXRoKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhbmFseXN0X3NwcmVhZHNoZWV0SWQnLCBhbmFseXN0X3NwcmVhZHNoZWV0SWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19zcHJlYWRzaGVldElkJywgY2hhbmdlc19zcHJlYWRzaGVldElkKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGljdGlvbmFyeV9zcHJlYWRzaGVldElkJywgZGljdGlvbmFyeV9zcHJlYWRzaGVldElkKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhbmFseXN0X3dvcmtzaGVldElkJywgYW5hbHlzdF93b3Jrc2hlZXRJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3dvcmtzaGVldElkJywgY2hhbmdlc193b3Jrc2hlZXRJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RpY3Rpb25hcnlfd29ya3NoZWV0SWQnLCBkaWN0aW9uYXJ5X3dvcmtzaGVldElkKTtcbiAgICBcbn1cblxuZnVuY3Rpb24gZ2V0UGF0aHMoKSB7XG4gICAgbGV0IGFuYWx5c3Rfc2hlZXRfcGF0aCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhbmFseXN0X3NoZWV0X3BhdGgnKTtcbiAgICBsZXQgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19wYXRoJyk7XG4gICAgbGV0IGRpY3Rpb25hcnlfcGF0aCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkaWN0aW9uYXJ5X3BhdGgnKTtcblxuICAgICQoJyNhbmFseXN0X3NoZWV0X3BhdGgnKS52YWwoYW5hbHlzdF9zaGVldF9wYXRoKTtcbiAgICAkKCcjYW5hbHlzdF9zaGVldF91cmwnKS5hdHRyKCdocmVmJywgYW5hbHlzdF9zaGVldF9wYXRoKTtcblxuICAgICQoJyNpbXBvcnRhbnRfY2hhbmdlc19wYXRoJykudmFsKGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuICAgICQoJyNpbXBvcnRhbnRfY2hhbmdlc191cmwnKS5hdHRyKCdocmVmJywgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG5cbiAgICAkKCcjZGljdGlvbmFyeV9wYXRoJykudmFsKGRpY3Rpb25hcnlfcGF0aCk7XG4gICAgJCgnI2RpY3Rpb25hcnlfdXJsJykuYXR0cignaHJlZicsIGRpY3Rpb25hcnlfcGF0aCk7XG59XG5cbmZ1bmN0aW9uIGdldFNwcmVhZHNoZWV0SWQodXJsOiBzdHJpbmcpIHtcbiAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKFwiL3NwcmVhZHNoZWV0cy9kLyhbYS16QS1aMC05LV9dKylcIik7XG4gICAgbGV0IG1hdGNoZXMgPSB1cmwubWF0Y2gocmUpO1xuICAgIHJldHVybiAobWF0Y2hlcykgPyBtYXRjaGVzWzFdIDogJyc7XG59XG5cbmZ1bmN0aW9uIGdldFdvcmtzaGVldElkKHVybDogc3RyaW5nKSB7XG4gICAgbGV0IHJlID0gbmV3IFJlZ0V4cChcIlsjJl1naWQ9KFswLTldKylcIik7XG4gICAgbGV0IG1hdGNoZXMgPSB1cmwubWF0Y2gocmUpO1xuICAgIHJldHVybiAobWF0Y2hlcykgPyBtYXRjaGVzWzFdIDogJyc7XG59XG5cbi8vVE9ETzogbWF5YmUgLSBpbnN0YWxsIG5wbSBsaWIgZm9yIGdhcGkgYW5kIHVzZSB0aGF0IGluc3RlYWRcbmZ1bmN0aW9uIG1ha2VSZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCB1cmw6c3RyaW5nLCBkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgdmFyIGF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuICBpZiAoIWF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ1NpZ25pbiByZXF1aXJlZC4nKSk7XG4gIH1cbiAgdmFyIGFjY2Vzc1Rva2VuID0gYXV0aC5jdXJyZW50VXNlci5nZXQoKS5nZXRBdXRoUmVzcG9uc2UoKS5hY2Nlc3NfdG9rZW47XG4gICQuYWpheCh1cmwsIHtcbiAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBhY2Nlc3NUb2tlbixcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICB9LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5tZXNzYWdlKSk7XG4gICAgfVxuICB9KTtcbn1cblxuIiwiaW1wb3J0IHtnYXBpQ2FsbGJhY2tzfSBmcm9tICcuL2dvb2dsZS1hdXRoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpc3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBsZXQgc2hlZXRJRCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhbmFseXN0X3NwcmVhZHNoZWV0SWQnKTtcbiAgICBsZXQgcmFuZ2UgPSAnQTc6QUUnO1xuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xuICAgICAgICAgICAgJ3BhdGgnOiBwYXRoLFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLnJlc3VsdC52YWx1ZXMpXG4gICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgICAgICByZWplY3QoRXJyb3IoJ0RpZG5cXCd0IGdldCB2YWx1ZXMnKSk7XG4gICAgICAgIH0pO1xuICAgIH0pOyAgICBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlUm93KHJlY29yZDogYW55KSB7XG4gICAgbGV0IGluZGV4ID0gcmVjb3JkWzBdO1xuICAgIGxldCB1cGRhdGVkX2F0ID0gcmVjb3JkWzJdO1xuICAgIGxldCBzaXRlID0gcmVjb3JkWzRdO1xuICAgIGxldCB0aXRsZSA9IHJlY29yZFs1XTtcbiAgICBsZXQgdXJsID0gcmVjb3JkWzZdO1xuICAgIGxldCB2ZXJzaW9uaXN0YV91cmwgPSByZWNvcmRbN107XG4gICAgbGV0IGRpZmZfd2l0aF9wcmV2aW91c191cmwgPSByZWNvcmRbOF07XG4gICAgbGV0IGRpZmZfd2l0aF9maXJzdF91cmwgPSByZWNvcmRbOV0gfHwgJyc7XG5cbiAgICBsZXQgcm93ID0gJCgnPHRyPicpLmF0dHIoJ2lkJywgYHJvd19yZWNvcmRfJHtpbmRleH1gKS5hcHBlbmQoXG4gICAgICAgICQoJzx0ZD4nKS50ZXh0KGluZGV4KSxcbiAgICAgICAgJCgnPHRkPicpLnRleHQodXBkYXRlZF9hdCksXG4gICAgICAgICQoJzx0ZD4nKS50ZXh0KHNpdGUpLFxuICAgICAgICAkKCc8dGQ+JykudGV4dCh0aXRsZSksXG4gICAgICAgICQoJzx0ZD4nKS5odG1sKGA8YSBocmVmPVwiaHR0cHM6Ly8ke3VybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiPiR7dXJsLnN1YnN0cigwLCAyMCl9Li4uPC9hPmApLFxuICAgICAgICAkKCc8dGQ+JykuaHRtbChgPGEgaHJlZj1cIiR7dmVyc2lvbmlzdGFfdXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+JHt2ZXJzaW9uaXN0YV91cmwuc3Vic3RyKC0xNSl9PC9hPmApLFxuICAgICAgICAkKCc8dGQ+JykuaHRtbChgPGEgaHJlZj1cIiR7ZGlmZl93aXRoX3ByZXZpb3VzX3VybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiPiR7ZGlmZl93aXRoX3ByZXZpb3VzX3VybC5zdWJzdHIoLTE1KX08L2E+YCksXG4gICAgICAgICQoJzx0ZD4nKS5odG1sKGA8YSBocmVmPVwiJHtkaWZmX3dpdGhfZmlyc3RfdXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+JHtkaWZmX3dpdGhfZmlyc3RfdXJsLnN1YnN0cigtMTUpfTwvYT5gKVxuICAgICk7XG5cbiAgICByb3cuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIHNob3dQYWdlKHBhcnNlSW50KHJvdy5kYXRhKCdyb3dfaW5kZXgnKSwgMTApKTtcbiAgICAgICAgLy8gc2V0UGFnaW5hdGlvbihyb3cuZGF0YSgncHJldl9yZWNvcmQnKSwgcm93LmRhdGEoJ25leHRfcmVjb3JkJykpO1xuICAgIH0pO1xuICAgIHJldHVybiByb3c7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93UGFnZShyb3dfaW5kZXg6IG51bWJlcikge1xuICAgIGxldCBzaGVldElEID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FuYWx5c3Rfc3ByZWFkc2hlZXRJZCcpO1xuICAgIGxldCByYW5nZSA9IGBBJHtyb3dfaW5kZXh9OkFHJHtyb3dfaW5kZXh9YFxuXG4gICAgLy8gSW5mbyBvbiBzcHJlYWRzaGVldHMudmFsdWVzLmdldDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9yZWZlcmVuY2UvcmVzdC92NC9zcHJlYWRzaGVldHMudmFsdWVzL2dldFxuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG4gICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XG4gICAgICAgICdwYXRoJzogcGF0aCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gd3JpdGUgdG8gc3ByZWFkc2hlZXRzOiBcbiAgICAgICAgLy8gMSkgR2V0IHN0YXJ0ZWQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcXVpY2tzdGFydC9qc1xuICAgICAgICAvLyAyKSBSZWFkL3dyaXRlIGRvY3M6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvZ3VpZGVzL3ZhbHVlc1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSByZXNwb25zZS5yZXN1bHQudmFsdWVzO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcm93X2RhdGEgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB2YXIgb2xkX3VybCA9IHJvd19kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIG5ld191cmwgPSByb3dfZGF0YVs5XTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBzaG91bGQgYmUgcGxhY2VkIGhlcmVcbiAgICAgICAgICAgIC8vIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmVjb3JkKCkge1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93TWV0YWRhdGEoKSB7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBhZ2luYXRpb24oKSB7XG5cbn1cblxuLy8gZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcbi8vICAgICB2YXIgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdpbmRleCcpKSB8fCA3O1xuLy8gICAgICQoJyNwcmV2X2luZGV4JykudGV4dChgPC0tIFJvdyAke2luZGV4LTF9YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleC0xfWApO1xuLy8gICAgICQoJyNuZXh0X2luZGV4JykudGV4dChgUm93ICR7aW5kZXgrMX0gLS0+YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleCsxfWApO1xuLy8gfSIsImltcG9ydCB7Z2FwaUNhbGxiYWNrc30gZnJvbSAnLi9nb29nbGUtYXV0aCc7XG5pbXBvcnQgKiBhcyBsaXN0X2dvb2dsZSBmcm9tICcuL2xpc3R2aWV3LWdvb2dsZSc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIHNldHVwIGhhbmRsZXJzIFxuICAgICQoJyNsbmtfdG9nZ2xlX3NpZ25pZmllcnMnKS5jbGljayh0b2dnbGVTaWduaWZpZXJBYmJyZXZpYXRpb25zKTtcbiAgICAkKCcjbG5rX3ZpZXdfbGlzdCcpLmNsaWNrKHRvZ2dsZUxpc3RWaWV3KTsgXG5cbiAgICAvL1RPRE8gLSB1bmRlcnN0YW5kIGhvdyB0aGlzIG1hZ2ljIHdvcmtzIVxuICAgIC8vIGh0dHBzOi8vYWR2YW5jZWR3ZWIuaHUvMjAxNS8wNS8xMi91c2luZy1nb29nbGUtYXV0aC1pbi1qYXZhc2NyaXB0L1xuICAgIC8vIGh0dHA6Ly9tcmNvbGVzLmNvbS9ibG9nL2dvb2dsZS1hbmFseXRpY3MtYXN5bmNocm9ub3VzLXRyYWNraW5nLWhvdy1pdC13b3JrL1xuICAgIGdhcGlDYWxsYmFja3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxpc3RfZ29vZ2xlLmdldExpc3QoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBsZXQgcmVjb3JkcyA9IHJlc3BvbnNlO1xuXG4gICAgICAgICAgICBsZXQgdGFibGUgPSAkKCcjdGJsX2xpc3RfdmlldycpO1xuICAgICAgICAgICAgbGV0IGRpZmYgPSAkKCcjZGlmZl92aWV3Jyk7XG4gICAgICAgICAgICB0YWJsZS5maW5kKCd0aGVhZCcpLmFwcGVuZChnZXRUYWJsZUhlYWRlcigpKTtcblxuICAgICAgICAgICAgY29uc3QgdGJvZHkgPSB0YWJsZS5maW5kKCd0Ym9keScpO1xuICAgICAgICAgICAgY29uc3QgdG90YWxSZWNvcmRMZW5ndGggPSAzMTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFfc3RhcnRfaW5kZXggPSA3O1xuXG4gICAgICAgICAgICByZWNvcmRzLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkOiBhbnksIGluZGV4OiBudW1iZXIsIHJlY29yZHM6IGFueSkge1xuICAgICAgICAgICAgICAgIC8vIGdhcGkgd2lsbCBub3QgcmV0dXJuIGVtcHR5IGNvbHVtbnMsIHNvIHdlIGhhdmUgdG8gcGFkIHRoZW0gXG4gICAgICAgICAgICAgICAgaWYgKHJlY29yZC5sZW5ndGggPCB0b3RhbFJlY29yZExlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IHRvdGFsUmVjb3JkTGVuZ3RoIC0gcmVjb3JkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSA+IDApIHJlY29yZC5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgcm93ID0gbGlzdF9nb29nbGUuZ2V0VGFibGVSb3cocmVjb3JkKTtcbiAgICAgICAgICAgICAgICByb3cuZGF0YSgncm93X2luZGV4JywgaW5kZXggKyBkYXRhX3N0YXJ0X2luZGV4KTtcbiAgICAgICAgICAgICAgICAvLyByb3cuZGF0YSgncHJldl9yZWNvcmQnLCByZWNvcmRzW2luZGV4LTFdKTtcbiAgICAgICAgICAgICAgICAvLyByb3cuZGF0YSgnbmV4dF9yZWNvcmQnLCByZWNvcmRzW2luZGV4KzFdKTtcbiAgICAgICAgICAgICAgICB0Ym9keS5hcHBlbmQocm93KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0b2dnbGVQcm9ncmVzc2JhcihmYWxzZSk7XG4gICAgICAgIH0pOyBcbiAgICB9KTtcbn0pO1xuXG5mdW5jdGlvbiB0b2dnbGVMaXN0VmlldygpIHtcbiAgICAkKCcjY29udGFpbmVyX2xpc3RfdmlldycpLnNob3coKTtcbiAgICAkKCcjY29udGFpbmVyX3BhZ2VfdmlldycpLmhpZGUoKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlUGFnZVZpZXcoKSB7XG4gICAgJCgnI2NvbnRhaW5lcl9saXN0X3ZpZXcnKS5oaWRlKCk7XG4gICAgJCgnI2NvbnRhaW5lcl9wYWdlX3ZpZXcnKS5zaG93KCk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVByb2dyZXNzYmFyKGlzVmlzaWJsZTogYm9vbGVhbikge1xuICAgIGlmKGlzVmlzaWJsZSkge1xuICAgICAgICAkKCcucHJvZ3Jlc3MnKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnLnByb2dyZXNzJykuaGlkZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlU2lnbmlmaWVyQWJicmV2aWF0aW9ucyhlOiBhbnkpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmluZm8tdGV4dCcpLnRvZ2dsZSgpO1xuICAgICQoJyNpbnNwZWN0b3JWaWV3JykudG9nZ2xlQ2xhc3MoJ3Nob3J0LXZpZXcnKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGFibGVIZWFkZXIoKSB7XG4gICAgcmV0dXJuICQoJzx0cj4nKS5hcHBlbmQoXG4gICAgICAgICQoJzx0aD4nKS50ZXh0KCdJRCcpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ091dHB1dCBEYXRlJyksIFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnU2l0ZScpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1BhZ2UgTmFtZScpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1VybCcpLFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnUGFnZSBWaWV3IFVybCcpLFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnTGFzdCBUd28nKSxcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ0xhdGVzdCB0byBCYXNlJykpO1xufVxuXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygncmVhZHknKTtcbn0pXG5cbmZ1bmN0aW9uIGxvYWRJZnJhbWUoaHRtbF9lbWJlZDogc3RyaW5nKSB7XG4gICAgLy8gaW5qZWN0IGh0bWxcbiAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpZmZfdmlldycpO1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyY2RvYycsIGh0bWxfZW1iZWQpO1xuXG4gICAgaWZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBpbmplY3QgZGlmZi5jc3MgdG8gaGlnaGxpZ2h0IDxpbnM+IGFuZCA8ZGVsPiBlbGVtZW50c1xuICAgICAgICB2YXIgZnJtID0gKGZyYW1lcyBhcyBhbnkpWydkaWZmX3ZpZXcnXS5jb250ZW50RG9jdW1lbnQ7XG4gICAgICAgIHZhciBvdGhlcmhlYWQgPSBmcm0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgdmFyIGxpbmsgPSBmcm0uY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgncmVsJywgJ3N0eWxlc2hlZXQnKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9jc3MvZGlmZi5jc3NgKTtcbiAgICAgICAgb3RoZXJoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuXG4gICAgICAgIC8vIHNldCBpZnJhbWUgaGVpZ2h0ID0gZnJhbWUgY29udGVudFxuICAgICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLChpZnJhbWUgYXMgYW55KS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9O1xufVxuIl19
