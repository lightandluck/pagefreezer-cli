function getTableRow(record: any) {

}

function showPage(row_index: number) {
    // link to test spreadsheet: https://docs.google.com/spreadsheets/d/17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ/edit#gid=0
    var sheetID = '17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ'
    var range = `A${row_index}:AG${row_index}`

    // Info on spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
    var path = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}`;
    gapi.client.request({
        'path': path,
    }).then(function (response: any) {
        // If we need to write to spreadsheets: 
        // 1) Get started: https://developers.google.com/sheets/api/quickstart/js
        // 2) Read/write docs: https://developers.google.com/sheets/api/guides/values

        var values = response.result.values;
        if (values) {
            var row_data = values[0];
            var old_url = row_data[8];
            var new_url = row_data[9];

            console.log(row_data);
            // TODO: determine if old function calls should be placed here
            // showDiffMetadata(row_data);
            // runDiff(old_url, new_url);
            
        } else {
            $('#diff_title').text('No data found')
        }
    }, function (response: any) {
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