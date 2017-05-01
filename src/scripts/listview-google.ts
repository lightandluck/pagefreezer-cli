import {gapiCallbacks} from './google-auth';

export function getList(): Promise<any> {
    let sheetID = localStorage.getItem('analyst_spreadsheetId');
    let range = 'A7:AE';
    var path = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}`;

    return new Promise(function(resolve, reject) {
        gapi.client.request({
            'path': path,
        }).then(function (response: any) {
            resolve(response.result.values)
        }, function (response: any) {
            reject(Error('Didn\'t get values'));
        });
    });    
}

export function getTableRow(record: any) {
    let index = record[0];
    let updated_at = record[2];
    let site = record[4];
    let title = record[5];
    let url = record[6];
    let versionista_url = record[7];
    let diff_with_previous_url = record[8];
    let diff_with_first_url = record[9] || '';

    let row = $('<tr>').attr('id', `row_record_${index}`).append(
        $('<td>').text(index),
        $('<td>').text(updated_at),
        $('<td>').text(site),
        $('<td>').text(title),
        $('<td>').html(`<a href="https://${url}" target="_blank" rel="noopener">${url.substr(0, 20)}...</a>`),
        $('<td>').html(`<a href="${versionista_url}" target="_blank" rel="noopener">${versionista_url.substr(-15)}</a>`),
        $('<td>').html(`<a href="${diff_with_previous_url}" target="_blank" rel="noopener">${diff_with_previous_url.substr(-15)}</a>`),
        $('<td>').html(`<a href="${diff_with_first_url}" target="_blank" rel="noopener">${diff_with_first_url.substr(-15)}</a>`)
    );

    row.click(function() {
        showPage(parseInt(row.data('row_index'), 10));
        // setPagination(row.data('prev_record'), row.data('next_record'));
    });
    return row;
}

export function showPage(row_index: number) {
    let sheetID = localStorage.getItem('analyst_spreadsheetId');
    let range = `A${row_index}:AG${row_index}`

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

export function updateRecord() {

}

export function showMetadata() {

}

export function setPagination() {

}

// function setPagination() {
//     var urlParams = new URLSearchParams(window.location.search);
//     var index = parseInt(urlParams.get('index')) || 7;
//     $('#prev_index').text(`<-- Row ${index-1}`).attr('href', `/diffbyindex?index=${index-1}`);
//     $('#next_index').text(`Row ${index+1} -->`).attr('href', `/diffbyindex?index=${index+1}`);
// }