$(document).ready(() => {
    $('#settings').click(handleSettings); 
    $('#lnk_add_important_change').click(handleAddImportantChange);
    $('#lnk_add_dictionary').click(handleAddDictionary);

    //TODO - create init function to show settings if none exist
});

function handleSettings() {
    return $.get('settings.html', (data) => {
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

function handleAddImportantChange(e: any) {
    console.log(e);
    let spreadsheetId = localStorage.getItem('important_changes_spreadsheetId');
    var url = encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A10:append?valueInputOption=USER_ENTERED`);

    var values = {
        "values": [
                ["test", "hello", "world"]
            ]
        }

    makeRequest('POST', url, JSON.stringify(values), function(err: any) {
        if (err) return console.log(err);
        alert('Change exported.');
    });
}

function handleAddDictionary() {
    
    let spreadsheetId = localStorage.getItem('dictionary_spreadsheetId');
    var url = encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A10:append?valueInputOption=USER_ENTERED`);

    var values = {
        "values": [
                ["test", "hello", "world"]
            ]
        }

    makeRequest('POST', url, JSON.stringify(values), function(err: any) {
        if (err) return console.log(err);
        alert('Dictionary exported.');
    });
}

function savePaths() {
    let analyst_sheet_path = $('#analyst_sheet_path').val();
    let important_changes_path = $('#important_changes_path').val();
    let dictionary_path = $('#dictionary_path').val();

    let analyst_spreadsheetId = getSpreadsheetId(analyst_sheet_path);
    let changes_spreadsheetId = getSpreadsheetId(important_changes_path);
    let dictionary_spreadsheetId = getSpreadsheetId(dictionary_path);

    let analyst_worksheetId = getWorksheetId(analyst_sheet_path);
    let changes_worksheetId = getWorksheetId(important_changes_path);
    let dictionary_worksheetId = getWorksheetId(dictionary_path);

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
    let analyst_sheet_path = localStorage.getItem('analyst_sheet_path');
    let important_changes_path = localStorage.getItem('important_changes_path');
    let dictionary_path = localStorage.getItem('dictionary_path');

    $('#analyst_sheet_path').val(analyst_sheet_path);
    $('#analyst_sheet_url').attr('href', analyst_sheet_path);

    $('#important_changes_path').val(important_changes_path);
    $('#important_changes_url').attr('href', important_changes_path);

    $('#dictionary_path').val(dictionary_path);
    $('#dictionary_url').attr('href', dictionary_path);
}

function getSpreadsheetId(url: string) {
    let re = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)");
    let matches = url.match(re);
    return (matches) ? matches[1] : '';
}

function getWorksheetId(url: string) {
    let re = new RegExp("[#&]gid=([0-9]+)");
    let matches = url.match(re);
    return (matches) ? matches[1] : '';
}

//TODO: maybe - install npm lib for gapi and use that instead
function makeRequest(method: string, url:string, data: any, callback: any) {
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
    success: function(response) {
      return callback(null, response);
    },
    error: function(response) {
      return callback(new Error(response.responseJSON.message));
    }
  });
}

