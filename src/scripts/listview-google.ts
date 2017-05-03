import {gapiCallbacks} from './google-auth';
import {makeRequest} from './google-auth';

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

export function getTableRow(row_data: any[]) {
    let record = new Record(row_data);

    let row = $('<tr>').attr('id', `row_record_${record.index}`).append(
        $('<td>').text(record.index),
        $('<td>').text(record.updated_at),
        $('<td>').text(record.site),
        $('<td>').text(record.title),
        $('<td>').html(`<a href="https://${record.url}" target="_blank" rel="noopener">${record.url.substr(0, 20)}...</a>`),
        $('<td>').html(`<a href="${record.versionista_url}" target="_blank" rel="noopener">${record.versionista_url.substr(-15)}</a>`),
        $('<td>').html(`<a href="${record.diff_with_previous_url}" target="_blank" rel="noopener">${record.diff_with_previous_url.substr(-15)}</a>`),
        $('<td>').html(`<a href="${record.diff_with_first_url}" target="_blank" rel="noopener">${record.diff_with_first_url.substr(-15)}</a>`)
    );

    row.click(function() {
        let row_index = parseInt(row.data('row_index'), 10);
        showPage(row_index);
        setPagination(row_index - 1, row_index + 1);
    });
    return row;
}

export function showPage(row_index: number) {
    const sheetId = localStorage.getItem('analyst_spreadsheetId');
    const range = `A${row_index}:AE${row_index}`

    // Info on spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
    const path = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

    gapiCallbacks.push(function() {
        gapi.client.request({
            'path': path,
        }).then(function (response: any) {
            // If we need to write to spreadsheets: 
            // 1) Get started: https://developers.google.com/sheets/api/quickstart/js
            // 2) Read/write docs: https://developers.google.com/sheets/api/guides/values

            const values = response.result.values;

            if (values) {
                togglePageView();
                let row_data = values[0];
                let diff_with_previous_url = row_data[8];
                let diff_with_first_url = row_data[9] || '';

                // populate versionista links
                $('#lnk_last_two_diff').attr('href', diff_with_previous_url || '');
                $('#lnk_last_to_base_diff').attr('href', diff_with_first_url || '');

                $('#lnk_update_record').off('click').on('click', function() {
                    let annotations: any = {};
                    let update_values: string[] = [];
                    annotations.values = [];
                    
                    // Build up annotations object
                    $('#inspectorView input[type="checkbox"]').each(function() {
                        update_values.push((this.checked) ? "y" : "");
                    })
                    annotations.values.push(update_values);
                    updateRecord(row_index, sheetId, annotations);
                });

                showMetadata(row_data);
                
            } else {
                setPagination(row_index - 2, row_index);
                alert('No data found');
            }
        }, function (response: any) {
            console.error('Error: ' + response.result.error.message);
        });
    });
}

function getRow(row_index: number) {
    const sheetId = localStorage.getItem('analyst_spreadsheetId');
    const range = `A${row_index}:AE${row_index}`

    // Info on spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
    const path = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

    gapiCallbacks.push(function() {
        gapi.client.request({
            'path': path,
        }).then(function (response: any) {
            const values = response.result.values;

            if (values) {
                return Promise.resolve(values);
                
            } else {
                return Promise.reject(`Error: ${response.result.error.message}`);
            }
        }, function (response: any) {
            return Promise.reject(`Error: ${response.result.error.message}`);
        });
    });
}

function updateRecord(row_index: number, sheetId: string, values: any[]) {
    let spreadsheetId = localStorage.getItem('analyst_spreadsheetId');
    var url = encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/N${row_index}:AE${row_index}?valueInputOption=USER_ENTERED`);

    makeRequest('PUT', url, JSON.stringify(values), function(err: any) {
        if (err) return console.log(err);
        alert('Signifiers updated.');
    });
}

function showMetadata(row_data: any) {
    let version_id = row_data[0] || 'No index',
        title = row_data[5] || 'No title',
        url = row_data[6] || 'No url';

    $('#diff_title').text(`${version_id} - ${title}`);
    $('#diff_page_url').attr('href', (url.includes('http')) ? url : `https://${url}`)
        .text(url).attr('target', '_blank')
        .attr('rel', 'noopener');

    $('#lnk_add_important_change').off().click(() => {
        handleAddImportantChange(row_data);
    });
    $('#lnk_add_dictionary').off().click(() => {
        handleAddDictionary(row_data);
    });

    let signifiers = row_data.slice(13, 31);
    let annotation = new Annotations(signifiers);
    
    if (Object.keys(annotation).length > 0) {
        Object.keys(annotation).forEach(function(key) {
            $(`#${key}`).prop('checked', annotation[key]);
        });
    } else {
        $('#inspectorView input[type="checkbox"]').each(function() {
            $(this).prop('checked', false);
        })
    }  
}

export function setPagination(prev_row_index: number, next_row_index: number) {
    // we assume records start at row 7
    const min_row_index = 7; 

    if (prev_row_index >= min_row_index) {
        $('#prev_index').show().off().click(() => {
            showPage(prev_row_index);
            setPagination(prev_row_index - 1, prev_row_index + 1);
        })
    } else $('#prev_index').hide();

    $('#next_index').show().off().click(function() {
        showPage(next_row_index);
        setPagination(next_row_index - 1, next_row_index + 1);
    })
}

function handleAddImportantChange(row_data: string[]) {
    let spreadsheetId = localStorage.getItem('important_changes_spreadsheetId');
    var url = encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A10:append?valueInputOption=USER_ENTERED`);

    let change = Array.from(row_data);
    change.splice(12, 0, "", "");
    change.unshift("0");

    let values: any = {
        "values": [
            change
        ]
    };

    makeRequest('POST', url, JSON.stringify(values), function(err: any) {
        if (err) return alert(err);
        alert('Change exported.');
    });
}

function handleAddDictionary(row_data: string[]) {
    
    let spreadsheetId = localStorage.getItem('dictionary_spreadsheetId');
    var url = encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A10:append?valueInputOption=USER_ENTERED`);

    let change = Array.from(row_data);
    change.splice(12, 0, "", "");
    change.unshift("0");

    let values: any = {
        "values": [
            change
        ]
    };

    makeRequest('POST', url, JSON.stringify(values), function(err: any) {
        if (err) return alert(err);
        alert('Dictionary exported.');
    });
}

function togglePageView() {
    $('#container_list_view').hide();
    $('#container_page_view').show();
}

class Annotations {
    [key: string]: boolean;
    public cbox_indiv_1: boolean;
    public cbox_indiv_2: boolean;
    public cbox_indiv_3: boolean;
    public cbox_indiv_4: boolean;
    public cbox_indiv_5: boolean;
    public cbox_indiv_6: boolean;
    public cbox_repeat_7: boolean;
    public cbox_repeat_8: boolean;
    public cbox_repeat_9: boolean;
    public cbox_repeat_10: boolean;
    public cbox_repeat_11: boolean;
    public cbox_repeat_12: boolean;
    public cbox_sig_1: boolean;
    public cbox_sig_2: boolean;
    public cbox_sig_3: boolean;
    public cbox_sig_4: boolean;
    public cbox_sig_5: boolean;
    public cbox_sig_6: boolean;
    
    constructor(signifiers: boolean[]) {
        this.cbox_indiv_1 = Boolean(signifiers[0]);
        this.cbox_indiv_2 = Boolean(signifiers[1]);
        this.cbox_indiv_3 = Boolean(signifiers[2]);
        this.cbox_indiv_4 = Boolean(signifiers[3]);
        this.cbox_indiv_5 = Boolean(signifiers[4]);
        this.cbox_indiv_6 = Boolean(signifiers[5]);

        this.cbox_repeat_7 = Boolean(signifiers[6]);
        this.cbox_repeat_8 = Boolean(signifiers[7]);
        this.cbox_repeat_9 = Boolean(signifiers[8]);
        this.cbox_repeat_10 = Boolean(signifiers[9]);
        this.cbox_repeat_11 = Boolean(signifiers[10]);
        this.cbox_repeat_12 = Boolean(signifiers[11]);

        this.cbox_sig_1 = Boolean(signifiers[12]);
        this.cbox_sig_2 = Boolean(signifiers[13]);
        this.cbox_sig_3 = Boolean(signifiers[14]);
        this.cbox_sig_4 = Boolean(signifiers[15]);
        this.cbox_sig_5 = Boolean(signifiers[16]);
        this.cbox_sig_6 = Boolean(signifiers[17]);
    }
}

class Record {
    [key: string]: string;
    index: string;
    updated_at: string;
    site: string;
    title: string;
    url: string;
    versionista_url: string;
    diff_with_previous_url: string;
    diff_with_first_url: string;

    constructor(record: any[]) {
        this.index = record[0];
        this.updated_at = record[2];
        this.site = record[4];
        this.title = record[5];
        this.url = record[6];
        this.versionista_url = record[7];
        this.diff_with_previous_url = record[8];
        this.diff_with_first_url = record[9] || '';
    }
}