$(document).ready(() => {
    $('#settings').click(function() {
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
    });

    $('#lnk_add_important_change').click(function() {
        let spreadsheetId = '1YK_kRUg8Za7ynTVbD70At39a_osnzhJBI2NfkLSGvtM';
        let range = 'Important Changes';

        var url = encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`);

        var values = {
            "values": [
                    ["test", "hello", "world"]
                ]
            }

        makeRequest('POST', url, JSON.stringify(values), function(err: any) {
            if (err) return console.log(err);
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
    let changes_url = localStorage.getItem('important_changes_path');
    let dictionary_url = localStorage.getItem('dictionary_path');
    let analyst_url = localStorage.getItem('analyst_sheet_path');

    $('#analyst_sheet_path').val(analyst_url);
    $('#anaylst_sheet_url').attr('href', analyst_url);

    $('#important_changes_path').val(changes_url);
    $('#important_changes_url').attr('href', changes_url);

    $('#dictionary_path').val(dictionary_url);
    $('#dictionary_url').attr('href', dictionary_url);
}
function getSpreadsheetId(url: string) {

}

function makeRequest(method: string, url:string, value: any, callback: any) {
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
    success: function(response) {
      return callback(null, response);
    },
    error: function(response) {
      return callback(new Error(response.responseJSON.message));
    }
  });
}

