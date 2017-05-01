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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9nb29nbGUtYXV0aC50cyIsInNyYy9zY3JpcHRzL2dvb2dsZS1zaGVldHMudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy1nb29nbGUudHMiLCJzcmMvc2NyaXB0cy9saXN0dmlldy50cyIsInNyYy9zY3JpcHRzL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsdUVBQXVFO0FBQzVELFFBQUEsYUFBYSxHQUFRLEVBQUUsQ0FBQztBQUd2QixRQUFBLEtBQUssR0FBRyw4Q0FBOEMsQ0FBQztBQUVuRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2QsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQixDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUIsZUFBZSxFQUFFLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0ksMkNBQTJDO0lBQzNDLHVEQUF1RDtJQUN2RCw2REFBNkQ7SUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVEO0lBQ0ksc0VBQXNFO0lBQ3RFLHdFQUF3RTtJQUN4RSxJQUFJLFlBQVksR0FBRyw2REFBNkQsQ0FBQztJQUVqRiw4RUFBOEU7SUFDOUUsOENBQThDO0lBQzlDLGlFQUFpRTtJQUNqRSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxVQUFVLElBQUk7UUFDckMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFDdEIsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDYixRQUFRLEVBQUUsT0FBTztZQUNqQixlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsVUFB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QUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQyxDQUFBO0FBRUYsb0JBQW9CLFVBQWtCO0lBQ2xDLGNBQWM7SUFDZCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7UUFDWix3REFBd0Q7UUFDeEQsSUFBSSxHQUFHLEdBQUksTUFBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUN2RCxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBSyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sa0JBQWUsQ0FBQyxDQUFDO1FBQ3BFLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsb0NBQW9DO1FBQ3BDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQWMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRixDQUFDLENBQUM7QUFDTixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEluaXRpYWxpemVzIEdvb2dsZSBBcGlzIGFuZCBleHBvcnRzIEdvb2dsZUF1dGggb2JqZWN0IGZvciB1cyB0byB1c2UuXG5leHBvcnQgbGV0IGdhcGlDYWxsYmFja3M6IGFueSA9IFtdO1xuXG5leHBvcnQgbGV0ICBHb29nbGVBdXRoOiBnYXBpLmF1dGgyLkdvb2dsZUF1dGgsXG4gICAgICAgICAgICBTQ09QRSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3NwcmVhZHNoZWV0cyc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBoYW5kbGVDbGllbnRMb2FkKCk7XG4gICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaGFuZGxlQXV0aENsaWNrKCk7XG4gICAgfSk7XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlQ2xpZW50TG9hZCgpIHtcbiAgICAvLyBMb2FkIHRoZSBBUEkncyBjbGllbnQgYW5kIGF1dGgyIG1vZHVsZXMuXG4gICAgLy8gQ2FsbCB0aGUgaW5pdENsaWVudCBmdW5jdGlvbiBhZnRlciB0aGUgbW9kdWxlcyBsb2FkLlxuICAgIC8vIGdhcGkgaXMgYSBnbG9iYWwgdmFyaWFibGUgY3JlYXRlZCBieSB0aGUgZ29vZ2xlIGFwaSBzY3JpcHRcbiAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsIGluaXRDbGllbnQpO1xufVxuXG5mdW5jdGlvbiBpbml0Q2xpZW50KCkge1xuICAgIC8vIFJldHJpZXZlIHRoZSBkaXNjb3ZlcnkgZG9jdW1lbnQgZm9yIHZlcnNpb24gNCBvZiBHb29nbGUgU2hlZXRzIEFQSS5cbiAgICAvLyBUaGlzIHdpbGwgcG9wdWxhdGUgbWV0aG9kcyBvbiBnYXBpIG9iamVjdCBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIGFwaS5cbiAgICBsZXQgZGlzY292ZXJ5VXJsID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL3NoZWV0cy92NC9yZXN0JztcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGdhcGkuY2xpZW50IG9iamVjdCwgd2hpY2ggdGhlIGFwcCB1c2VzIHRvIG1ha2UgQVBJIHJlcXVlc3RzLlxuICAgIC8vIEdldCBBUEkga2V5IGFuZCBjbGllbnQgSUQgZnJvbSBjb25maWcuanNvbi5cbiAgICAvLyAnc2NvcGUnIGZpZWxkIHNwZWNpZmllcyBzcGFjZS1kZWxpbWl0ZWQgbGlzdCBvZiBhY2Nlc3Mgc2NvcGVzLlxuICAgICQuZ2V0SlNPTignLi9jb25maWcuanNvbicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGxldCBBUElfS0VZID0gZGF0YS5BUElfS0VZLFxuICAgICAgICAgICAgQ0xJRU5UX0lEID0gZGF0YS5DTElFTlRfSUQ7XG4gICAgICAgIFxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcbiAgICAgICAgICAgICdhcGlLZXknOiBBUElfS0VZLFxuICAgICAgICAgICAgJ2Rpc2NvdmVyeURvY3MnOiBbZGlzY292ZXJ5VXJsXSxcbiAgICAgICAgICAgICdjbGllbnRJZCc6IENMSUVOVF9JRCxcbiAgICAgICAgICAgICdzY29wZSc6IFNDT1BFXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgR29vZ2xlQXV0aCA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3Igc2lnbi1pbiBzdGF0ZSBjaGFuZ2VzLlxuICAgICAgICAgICAgR29vZ2xlQXV0aC5pc1NpZ25lZEluLmxpc3Rlbih1cGRhdGVTaWduaW5TdGF0dXMpO1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgaW5pdGlhbCBzaWduLWluIHN0YXRlLiAoRGV0ZXJtaW5lIGlmIHVzZXIgaXMgYWxyZWFkeSBzaWduZWQgaW4uKVxuICAgICAgICAgICAgdXBkYXRlU2lnbmluU3RhdHVzKGZhbHNlKTtcbiAgICAgICAgfSkudGhlbihnYXBpTG9hZGVkKTtcbiAgICB9KVxuICAgIC5mYWlsKCgpID0+IGNvbnNvbGUubG9nKCdDb3VsZCBub3QgbG9hZCBjb25maWcuanNvbicpKTtcbn1cblxuZnVuY3Rpb24gZ2FwaUxvYWRlZCgpe1xuICAgIGxldCBHYXBpUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucHVzaCA9IGZ1bmN0aW9uIChjYWxsYmFjazogYW55KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGxldCBfb2xkX2dhcGlDYWxsYmFja3MgPSBnYXBpQ2FsbGJhY2tzO1xuICAgIGdhcGlDYWxsYmFja3MgPSBuZXcgR2FwaVF1ZXVlKCk7XG4gICAgX29sZF9nYXBpQ2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGdhcGlDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVBdXRoQ2xpY2soKSB7XG4gICAgaWYgKEdvb2dsZUF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgICAgICAvLyBVc2VyIGlzIGF1dGhvcml6ZWQgYW5kIGhhcyBjbGlja2VkICdTaWduIG91dCcgYnV0dG9uLlxuICAgICAgICBHb29nbGVBdXRoLnNpZ25PdXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2VyIGlzIG5vdCBzaWduZWQgaW4uIFN0YXJ0IEdvb2dsZSBhdXRoIGZsb3cuXG4gICAgICAgIEdvb2dsZUF1dGguc2lnbkluKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2b2tlQWNjZXNzKCkge1xuICAgIEdvb2dsZUF1dGguZGlzY29ubmVjdCgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTaWduaW5TdGF0dXMoaXNTaWduZWRJbjogYm9vbGVhbikge1xuICAgIGxldCB1c2VyID0gR29vZ2xlQXV0aC5jdXJyZW50VXNlci5nZXQoKTtcbiAgICBsZXQgaXNBdXRob3JpemVkID0gdXNlci5oYXNHcmFudGVkU2NvcGVzKFNDT1BFKTtcbiAgICBpZiAoaXNBdXRob3JpemVkKSB7XG4gICAgICAgICQoJyNzaWduLWluLW9yLW91dC1idXR0b24nKS5odG1sKCdTaWduIG91dCcpO1xuICAgICAgICBsZXQgcHJvZmlsZSA9IHVzZXIuZ2V0QmFzaWNQcm9maWxlKCk7XG4gICAgICAgICQoJyNhdXRoLXN0YXR1cycpLmh0bWwoYFdlbGNvbWUsICR7cHJvZmlsZS5nZXROYW1lKCl9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnI3NpZ24taW4tb3Itb3V0LWJ1dHRvbicpLmh0bWwoJ1NpZ24gSW4nKTtcbiAgICAgICAgJCgnI2F1dGgtc3RhdHVzJykuaHRtbCgnJyk7XG4gICAgfVxufVxuXG4vLyBUT0RPIC0gdW5kZXJzdGFuZCBob3cgdG8gY29uc3RydWN0IGNsYXNzIHNvIHR5cGVzY3JpcHQgY29tcGlsZXNcbi8vIC8vIFF1aWNrIHR5cGUgZm9yIEdhcGlRdWV1ZSBcbmRlY2xhcmUgY2xhc3MgR2FwaVF1ZXVlIHtcbiAgICAvKiogQ29uc3RydWN0b3IgcmV0dXJuaW5nIGEgR2FwaVF1ZXVlIG9iamVjdC4gKi9cbiAgICBjb25zdHJ1Y3Rvcihpbml0Pzogc3RyaW5nKTtcbiAgICBwdXNoKGNhbGxiYWNrOiBhbnkpOiBhbnk7XG59XG5cbiIsIiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICAkKCcjc2V0dGluZ3MnKS5jbGljayhoYW5kbGVTZXR0aW5ncyk7IFxuICAgICQoJyNsbmtfYWRkX2ltcG9ydGFudF9jaGFuZ2UnKS5jbGljayhoYW5kbGVBZGRJbXBvcnRhbnRDaGFuZ2UpO1xuICAgICQoJyNsbmtfYWRkX2RpY3Rpb25hcnknKS5jbGljayhoYW5kbGVBZGREaWN0aW9uYXJ5KTtcblxuICAgIC8vVE9ETyAtIGNyZWF0ZSBpbml0IGZ1bmN0aW9uIHRvIHNob3cgc2V0dGluZ3MgaWYgbm9uZSBleGlzdFxufSk7XG5cbmZ1bmN0aW9uIGhhbmRsZVNldHRpbmdzKCkge1xuICAgIHJldHVybiAkLmdldCgnc2V0dGluZ3MuaHRtbCcsIChkYXRhKSA9PiB7XG4gICAgICAgIGJvb3Rib3guZGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlOiAnU2V0dGluZ3MnLFxuICAgICAgICAgICAgbWVzc2FnZTogZGF0YSxcbiAgICAgICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAgICAgICBcIlNhdmVcIjoge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4tc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBzYXZlUGF0aHNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiQ2FuY2VsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYnRuLWRlZmF1bHQnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZ2V0UGF0aHMoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQWRkSW1wb3J0YW50Q2hhbmdlKGU6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIGxldCBzcHJlYWRzaGVldElkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3NwcmVhZHNoZWV0SWQnKTtcbiAgICB2YXIgdXJsID0gZW5jb2RlVVJJKGBodHRwczovL3NoZWV0cy5nb29nbGVhcGlzLmNvbS92NC9zcHJlYWRzaGVldHMvJHtzcHJlYWRzaGVldElkfS92YWx1ZXMvQTEwOmFwcGVuZD92YWx1ZUlucHV0T3B0aW9uPVVTRVJfRU5URVJFRGApO1xuXG4gICAgdmFyIHZhbHVlcyA9IHtcbiAgICAgICAgXCJ2YWx1ZXNcIjogW1xuICAgICAgICAgICAgICAgIFtcInRlc3RcIiwgXCJoZWxsb1wiLCBcIndvcmxkXCJdXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgIG1ha2VSZXF1ZXN0KCdQT1NUJywgdXJsLCBKU09OLnN0cmluZ2lmeSh2YWx1ZXMpLCBmdW5jdGlvbihlcnI6IGFueSkge1xuICAgICAgICBpZiAoZXJyKSByZXR1cm4gY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgYWxlcnQoJ0NoYW5nZSBleHBvcnRlZC4nKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQWRkRGljdGlvbmFyeSgpIHtcbiAgICBcbiAgICBsZXQgc3ByZWFkc2hlZXRJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkaWN0aW9uYXJ5X3NwcmVhZHNoZWV0SWQnKTtcbiAgICB2YXIgdXJsID0gZW5jb2RlVVJJKGBodHRwczovL3NoZWV0cy5nb29nbGVhcGlzLmNvbS92NC9zcHJlYWRzaGVldHMvJHtzcHJlYWRzaGVldElkfS92YWx1ZXMvQTEwOmFwcGVuZD92YWx1ZUlucHV0T3B0aW9uPVVTRVJfRU5URVJFRGApO1xuXG4gICAgdmFyIHZhbHVlcyA9IHtcbiAgICAgICAgXCJ2YWx1ZXNcIjogW1xuICAgICAgICAgICAgICAgIFtcInRlc3RcIiwgXCJoZWxsb1wiLCBcIndvcmxkXCJdXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgIG1ha2VSZXF1ZXN0KCdQT1NUJywgdXJsLCBKU09OLnN0cmluZ2lmeSh2YWx1ZXMpLCBmdW5jdGlvbihlcnI6IGFueSkge1xuICAgICAgICBpZiAoZXJyKSByZXR1cm4gY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgYWxlcnQoJ0RpY3Rpb25hcnkgZXhwb3J0ZWQuJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVQYXRocygpIHtcbiAgICBsZXQgYW5hbHlzdF9zaGVldF9wYXRoID0gJCgnI2FuYWx5c3Rfc2hlZXRfcGF0aCcpLnZhbCgpO1xuICAgIGxldCBpbXBvcnRhbnRfY2hhbmdlc19wYXRoID0gJCgnI2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnKS52YWwoKTtcbiAgICBsZXQgZGljdGlvbmFyeV9wYXRoID0gJCgnI2RpY3Rpb25hcnlfcGF0aCcpLnZhbCgpO1xuXG4gICAgbGV0IGFuYWx5c3Rfc3ByZWFkc2hlZXRJZCA9IGdldFNwcmVhZHNoZWV0SWQoYW5hbHlzdF9zaGVldF9wYXRoKTtcbiAgICBsZXQgY2hhbmdlc19zcHJlYWRzaGVldElkID0gZ2V0U3ByZWFkc2hlZXRJZChpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcbiAgICBsZXQgZGljdGlvbmFyeV9zcHJlYWRzaGVldElkID0gZ2V0U3ByZWFkc2hlZXRJZChkaWN0aW9uYXJ5X3BhdGgpO1xuXG4gICAgbGV0IGFuYWx5c3Rfd29ya3NoZWV0SWQgPSBnZXRXb3Jrc2hlZXRJZChhbmFseXN0X3NoZWV0X3BhdGgpO1xuICAgIGxldCBjaGFuZ2VzX3dvcmtzaGVldElkID0gZ2V0V29ya3NoZWV0SWQoaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG4gICAgbGV0IGRpY3Rpb25hcnlfd29ya3NoZWV0SWQgPSBnZXRXb3Jrc2hlZXRJZChkaWN0aW9uYXJ5X3BhdGgpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FuYWx5c3Rfc2hlZXRfcGF0aCcsIGFuYWx5c3Rfc2hlZXRfcGF0aCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3BhdGgnLCBpbXBvcnRhbnRfY2hhbmdlc19wYXRoKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGljdGlvbmFyeV9wYXRoJywgZGljdGlvbmFyeV9wYXRoKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhbmFseXN0X3NwcmVhZHNoZWV0SWQnLCBhbmFseXN0X3NwcmVhZHNoZWV0SWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19zcHJlYWRzaGVldElkJywgY2hhbmdlc19zcHJlYWRzaGVldElkKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGljdGlvbmFyeV9zcHJlYWRzaGVldElkJywgZGljdGlvbmFyeV9zcHJlYWRzaGVldElkKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhbmFseXN0X3dvcmtzaGVldElkJywgYW5hbHlzdF93b3Jrc2hlZXRJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ltcG9ydGFudF9jaGFuZ2VzX3dvcmtzaGVldElkJywgY2hhbmdlc193b3Jrc2hlZXRJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RpY3Rpb25hcnlfd29ya3NoZWV0SWQnLCBkaWN0aW9uYXJ5X3dvcmtzaGVldElkKTtcbiAgICBcbn1cblxuZnVuY3Rpb24gZ2V0UGF0aHMoKSB7XG4gICAgbGV0IGFuYWx5c3Rfc2hlZXRfcGF0aCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhbmFseXN0X3NoZWV0X3BhdGgnKTtcbiAgICBsZXQgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbXBvcnRhbnRfY2hhbmdlc19wYXRoJyk7XG4gICAgbGV0IGRpY3Rpb25hcnlfcGF0aCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkaWN0aW9uYXJ5X3BhdGgnKTtcblxuICAgICQoJyNhbmFseXN0X3NoZWV0X3BhdGgnKS52YWwoYW5hbHlzdF9zaGVldF9wYXRoKTtcbiAgICAkKCcjYW5hbHlzdF9zaGVldF91cmwnKS5hdHRyKCdocmVmJywgYW5hbHlzdF9zaGVldF9wYXRoKTtcblxuICAgICQoJyNpbXBvcnRhbnRfY2hhbmdlc19wYXRoJykudmFsKGltcG9ydGFudF9jaGFuZ2VzX3BhdGgpO1xuICAgICQoJyNpbXBvcnRhbnRfY2hhbmdlc191cmwnKS5hdHRyKCdocmVmJywgaW1wb3J0YW50X2NoYW5nZXNfcGF0aCk7XG5cbiAgICAkKCcjZGljdGlvbmFyeV9wYXRoJykudmFsKGRpY3Rpb25hcnlfcGF0aCk7XG4gICAgJCgnI2RpY3Rpb25hcnlfdXJsJykuYXR0cignaHJlZicsIGRpY3Rpb25hcnlfcGF0aCk7XG59XG5cbmZ1bmN0aW9uIGdldFNwcmVhZHNoZWV0SWQodXJsOiBzdHJpbmcpIHtcbiAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKFwiL3NwcmVhZHNoZWV0cy9kLyhbYS16QS1aMC05LV9dKylcIik7XG4gICAgbGV0IG1hdGNoZXMgPSB1cmwubWF0Y2gocmUpO1xuICAgIHJldHVybiAobWF0Y2hlcykgPyBtYXRjaGVzWzFdIDogJyc7XG59XG5cbmZ1bmN0aW9uIGdldFdvcmtzaGVldElkKHVybDogc3RyaW5nKSB7XG4gICAgbGV0IHJlID0gbmV3IFJlZ0V4cChcIlsjJl1naWQ9KFswLTldKylcIik7XG4gICAgbGV0IG1hdGNoZXMgPSB1cmwubWF0Y2gocmUpO1xuICAgIHJldHVybiAobWF0Y2hlcykgPyBtYXRjaGVzWzFdIDogJyc7XG59XG5cbi8vVE9ETzogbWF5YmUgLSBpbnN0YWxsIG5wbSBsaWIgZm9yIGdhcGkgYW5kIHVzZSB0aGF0IGluc3RlYWRcbmZ1bmN0aW9uIG1ha2VSZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCB1cmw6c3RyaW5nLCBkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgdmFyIGF1dGggPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpO1xuICBpZiAoIWF1dGguaXNTaWduZWRJbi5nZXQoKSkge1xuICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ1NpZ25pbiByZXF1aXJlZC4nKSk7XG4gIH1cbiAgdmFyIGFjY2Vzc1Rva2VuID0gYXV0aC5jdXJyZW50VXNlci5nZXQoKS5nZXRBdXRoUmVzcG9uc2UoKS5hY2Nlc3NfdG9rZW47XG4gICQuYWpheCh1cmwsIHtcbiAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBhY2Nlc3NUb2tlbixcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICB9LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5tZXNzYWdlKSk7XG4gICAgfVxuICB9KTtcbn1cblxuIiwiaW1wb3J0IHtnYXBpQ2FsbGJhY2tzfSBmcm9tICcuL2dvb2dsZS1hdXRoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpc3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBsZXQgc2hlZXRJRCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhbmFseXN0X3NwcmVhZHNoZWV0SWQnKTtcbiAgICBsZXQgcmFuZ2UgPSAnQTc6QUUnO1xuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xuICAgICAgICAgICAgJ3BhdGgnOiBwYXRoLFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLnJlc3VsdC52YWx1ZXMpXG4gICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgICAgICByZWplY3QoRXJyb3IoJ0RpZG5cXCd0IGdldCB2YWx1ZXMnKSk7XG4gICAgICAgIH0pO1xuICAgIH0pOyAgICBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlUm93KHJlY29yZDogYW55KSB7XG4gICAgbGV0IGluZGV4ID0gcmVjb3JkWzBdO1xuICAgIGxldCB1cGRhdGVkX2F0ID0gcmVjb3JkWzJdO1xuICAgIGxldCBzaXRlID0gcmVjb3JkWzRdO1xuICAgIGxldCB0aXRsZSA9IHJlY29yZFs1XTtcbiAgICBsZXQgdXJsID0gcmVjb3JkWzZdO1xuICAgIGxldCB2ZXJzaW9uaXN0YV91cmwgPSByZWNvcmRbN107XG4gICAgbGV0IGRpZmZfd2l0aF9wcmV2aW91c191cmwgPSByZWNvcmRbOF07XG4gICAgbGV0IGRpZmZfd2l0aF9maXJzdF91cmwgPSByZWNvcmRbOV0gfHwgJyc7XG5cbiAgICBsZXQgcm93ID0gJCgnPHRyPicpLmF0dHIoJ2lkJywgYHJvd19yZWNvcmRfJHtpbmRleH1gKS5hcHBlbmQoXG4gICAgICAgICQoJzx0ZD4nKS50ZXh0KGluZGV4KSxcbiAgICAgICAgJCgnPHRkPicpLnRleHQodXBkYXRlZF9hdCksXG4gICAgICAgICQoJzx0ZD4nKS50ZXh0KHNpdGUpLFxuICAgICAgICAkKCc8dGQ+JykudGV4dCh0aXRsZSksXG4gICAgICAgICQoJzx0ZD4nKS5odG1sKGA8YSBocmVmPVwiaHR0cHM6Ly8ke3VybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiPiR7dXJsLnN1YnN0cigwLCAyMCl9Li4uPC9hPmApLFxuICAgICAgICAkKCc8dGQ+JykuaHRtbChgPGEgaHJlZj1cIiR7dmVyc2lvbmlzdGFfdXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+JHt2ZXJzaW9uaXN0YV91cmwuc3Vic3RyKC0xNSl9PC9hPmApLFxuICAgICAgICAkKCc8dGQ+JykuaHRtbChgPGEgaHJlZj1cIiR7ZGlmZl93aXRoX3ByZXZpb3VzX3VybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiPiR7ZGlmZl93aXRoX3ByZXZpb3VzX3VybC5zdWJzdHIoLTE1KX08L2E+YCksXG4gICAgICAgICQoJzx0ZD4nKS5odG1sKGA8YSBocmVmPVwiJHtkaWZmX3dpdGhfZmlyc3RfdXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+JHtkaWZmX3dpdGhfZmlyc3RfdXJsLnN1YnN0cigtMTUpfTwvYT5gKVxuICAgICk7XG5cbiAgICByb3cuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIHNob3dQYWdlKHBhcnNlSW50KHJvdy5kYXRhKCdyb3dfaW5kZXgnKSwgMTApKTtcbiAgICAgICAgLy8gc2V0UGFnaW5hdGlvbihyb3cuZGF0YSgncHJldl9yZWNvcmQnKSwgcm93LmRhdGEoJ25leHRfcmVjb3JkJykpO1xuICAgIH0pO1xuICAgIHJldHVybiByb3c7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93UGFnZShyb3dfaW5kZXg6IG51bWJlcikge1xuICAgIGxldCBzaGVldElEID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FuYWx5c3Rfc3ByZWFkc2hlZXRJZCcpO1xuICAgIGxldCByYW5nZSA9IGBBJHtyb3dfaW5kZXh9OkFHJHtyb3dfaW5kZXh9YFxuXG4gICAgLy8gSW5mbyBvbiBzcHJlYWRzaGVldHMudmFsdWVzLmdldDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc2hlZXRzL2FwaS9yZWZlcmVuY2UvcmVzdC92NC9zcHJlYWRzaGVldHMudmFsdWVzL2dldFxuICAgIHZhciBwYXRoID0gYGh0dHBzOi8vc2hlZXRzLmdvb2dsZWFwaXMuY29tL3Y0L3NwcmVhZHNoZWV0cy8ke3NoZWV0SUR9L3ZhbHVlcy8ke3JhbmdlfWA7XG4gICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XG4gICAgICAgICdwYXRoJzogcGF0aCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gd3JpdGUgdG8gc3ByZWFkc2hlZXRzOiBcbiAgICAgICAgLy8gMSkgR2V0IHN0YXJ0ZWQ6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvcXVpY2tzdGFydC9qc1xuICAgICAgICAvLyAyKSBSZWFkL3dyaXRlIGRvY3M6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3NoZWV0cy9hcGkvZ3VpZGVzL3ZhbHVlc1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSByZXNwb25zZS5yZXN1bHQudmFsdWVzO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcm93X2RhdGEgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB2YXIgb2xkX3VybCA9IHJvd19kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIG5ld191cmwgPSByb3dfZGF0YVs5XTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gVE9ETzogZGV0ZXJtaW5lIGlmIG9sZCBmdW5jdGlvbiBjYWxscyBzaG91bGQgYmUgcGxhY2VkIGhlcmVcbiAgICAgICAgICAgIC8vIHNob3dEaWZmTWV0YWRhdGEocm93X2RhdGEpO1xuICAgICAgICAgICAgLy8gcnVuRGlmZihvbGRfdXJsLCBuZXdfdXJsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2RpZmZfdGl0bGUnKS50ZXh0KCdObyBkYXRhIGZvdW5kJylcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgcmVzcG9uc2UucmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmVjb3JkKCkge1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93TWV0YWRhdGEoKSB7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBhZ2luYXRpb24oKSB7XG5cbn1cblxuLy8gZnVuY3Rpb24gc2V0UGFnaW5hdGlvbigpIHtcbi8vICAgICB2YXIgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdpbmRleCcpKSB8fCA3O1xuLy8gICAgICQoJyNwcmV2X2luZGV4JykudGV4dChgPC0tIFJvdyAke2luZGV4LTF9YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleC0xfWApO1xuLy8gICAgICQoJyNuZXh0X2luZGV4JykudGV4dChgUm93ICR7aW5kZXgrMX0gLS0+YCkuYXR0cignaHJlZicsIGAvZGlmZmJ5aW5kZXg/aW5kZXg9JHtpbmRleCsxfWApO1xuLy8gfSIsImltcG9ydCB7Z2FwaUNhbGxiYWNrc30gZnJvbSAnLi9nb29nbGUtYXV0aCc7XG5pbXBvcnQgKiBhcyBsaXN0X2dvb2dsZSBmcm9tICcuL2xpc3R2aWV3LWdvb2dsZSc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIHNldHVwIGhhbmRsZXJzIFxuICAgICQoJyNsbmtfdG9nZ2xlX3NpZ25pZmllcnMnKS5jbGljayh0b2dnbGVTaWduaWZpZXJBYmJyZXZpYXRpb25zKTtcbiAgICAkKCcjbG5rX3ZpZXdfbGlzdCcpLmNsaWNrKHRvZ2dsZUxpc3RWaWV3KTsgXG5cbiAgICAvL1RPRE8gLSB1bmRlcnN0YW5kIGhvdyB0aGlzIG1hZ2ljIHdvcmtzIVxuICAgIC8vIGh0dHBzOi8vYWR2YW5jZWR3ZWIuaHUvMjAxNS8wNS8xMi91c2luZy1nb29nbGUtYXV0aC1pbi1qYXZhc2NyaXB0L1xuICAgIC8vIGh0dHA6Ly9tcmNvbGVzLmNvbS9ibG9nL2dvb2dsZS1hbmFseXRpY3MtYXN5bmNocm9ub3VzLXRyYWNraW5nLWhvdy1pdC13b3JrL1xuICAgIGdhcGlDYWxsYmFja3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxpc3RfZ29vZ2xlLmdldExpc3QoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBsZXQgcmVjb3JkcyA9IHJlc3BvbnNlO1xuXG4gICAgICAgICAgICBsZXQgdGFibGUgPSAkKCcjdGJsX2xpc3RfdmlldycpO1xuICAgICAgICAgICAgbGV0IGRpZmYgPSAkKCcjZGlmZl92aWV3Jyk7XG4gICAgICAgICAgICB0YWJsZS5maW5kKCd0aGVhZCcpLmFwcGVuZChnZXRUYWJsZUhlYWRlcigpKTtcblxuICAgICAgICAgICAgY29uc3QgdGJvZHkgPSB0YWJsZS5maW5kKCd0Ym9keScpO1xuICAgICAgICAgICAgY29uc3QgdG90YWxSZWNvcmRMZW5ndGggPSAzMTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFfc3RhcnRfaW5kZXggPSA3O1xuXG4gICAgICAgICAgICByZWNvcmRzLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkOiBhbnksIGluZGV4OiBudW1iZXIsIHJlY29yZHM6IGFueSkge1xuICAgICAgICAgICAgICAgIC8vIGdhcGkgd2lsbCBub3QgcmV0dXJuIGVtcHR5IGNvbHVtbnMsIHNvIHdlIGhhdmUgdG8gcGFkIHRoZW0gXG4gICAgICAgICAgICAgICAgaWYgKHJlY29yZC5sZW5ndGggPCB0b3RhbFJlY29yZExlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IHRvdGFsUmVjb3JkTGVuZ3RoIC0gcmVjb3JkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSA+IDApIHJlY29yZC5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgcm93ID0gbGlzdF9nb29nbGUuZ2V0VGFibGVSb3cocmVjb3JkKTtcbiAgICAgICAgICAgICAgICByb3cuZGF0YSgncm93X2luZGV4JywgaW5kZXggKyBkYXRhX3N0YXJ0X2luZGV4KTtcbiAgICAgICAgICAgICAgICAvLyByb3cuZGF0YSgncHJldl9yZWNvcmQnLCByZWNvcmRzW2luZGV4LTFdKTtcbiAgICAgICAgICAgICAgICAvLyByb3cuZGF0YSgnbmV4dF9yZWNvcmQnLCByZWNvcmRzW2luZGV4KzFdKTtcbiAgICAgICAgICAgICAgICB0Ym9keS5hcHBlbmQocm93KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0b2dnbGVQcm9ncmVzc2JhcihmYWxzZSk7XG4gICAgICAgIH0pOyBcbiAgICB9KTtcbn0pO1xuXG5mdW5jdGlvbiB0b2dnbGVMaXN0VmlldygpIHtcbiAgICAkKCcjY29udGFpbmVyX2xpc3RfdmlldycpLnNob3coKTtcbiAgICAkKCcjY29udGFpbmVyX3BhZ2VfdmlldycpLmhpZGUoKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlUGFnZVZpZXcoKSB7XG4gICAgJCgnI2NvbnRhaW5lcl9saXN0X3ZpZXcnKS5oaWRlKCk7XG4gICAgJCgnI2NvbnRhaW5lcl9wYWdlX3ZpZXcnKS5zaG93KCk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVByb2dyZXNzYmFyKGlzVmlzaWJsZTogYm9vbGVhbikge1xuICAgIGlmKGlzVmlzaWJsZSkge1xuICAgICAgICAkKCcucHJvZ3Jlc3MnKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnLnByb2dyZXNzJykuaGlkZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlU2lnbmlmaWVyQWJicmV2aWF0aW9ucyhlOiBhbnkpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmluZm8tdGV4dCcpLnRvZ2dsZSgpO1xuICAgICQoJyNpbnNwZWN0b3JWaWV3JykudG9nZ2xlQ2xhc3MoJ3Nob3J0LXZpZXcnKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGFibGVIZWFkZXIoKSB7XG4gICAgcmV0dXJuICQoJzx0cj4nKS5hcHBlbmQoXG4gICAgICAgICQoJzx0aD4nKS50ZXh0KCdJRCcpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ091dHB1dCBEYXRlJyksIFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnU2l0ZScpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1BhZ2UgTmFtZScpLCBcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ1VybCcpLFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnUGFnZSBWaWV3IFVybCcpLFxuICAgICAgICAkKCc8dGg+JykudGV4dCgnTGFzdCBUd28nKSxcbiAgICAgICAgJCgnPHRoPicpLnRleHQoJ0xhdGVzdCB0byBCYXNlJykpO1xufVxuXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygncmVhZHknKTtcbn0pXG5cbmZ1bmN0aW9uIGxvYWRJZnJhbWUoaHRtbF9lbWJlZDogc3RyaW5nKSB7XG4gICAgLy8gaW5qZWN0IGh0bWxcbiAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpZmZfdmlldycpO1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyY2RvYycsIGh0bWxfZW1iZWQpO1xuXG4gICAgaWZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBpbmplY3QgZGlmZi5jc3MgdG8gaGlnaGxpZ2h0IDxpbnM+IGFuZCA8ZGVsPiBlbGVtZW50c1xuICAgICAgICB2YXIgZnJtID0gKGZyYW1lcyBhcyBhbnkpWydkaWZmX3ZpZXcnXS5jb250ZW50RG9jdW1lbnQ7XG4gICAgICAgIHZhciBvdGhlcmhlYWQgPSBmcm0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgdmFyIGxpbmsgPSBmcm0uY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgncmVsJywgJ3N0eWxlc2hlZXQnKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9jc3MvZGlmZi5jc3NgKTtcbiAgICAgICAgb3RoZXJoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuXG4gICAgICAgIC8vIHNldCBpZnJhbWUgaGVpZ2h0ID0gZnJhbWUgY29udGVudFxuICAgICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLChpZnJhbWUgYXMgYW55KS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9O1xufVxuIl19
