import {gapiCallbacks} from './google-auth';
import * as list_google from './listview-google';

$(document).ready(function() {
    // setup handlers 
    $('#lnk_toggle_signifiers').click(toggleSignifierAbbreviations);
    $('#lnk_view_list').click(toggleListView); 

    //TODO - understand how this magic works!
    // https://advancedweb.hu/2015/05/12/using-google-auth-in-javascript/
    // http://mrcoles.com/blog/google-analytics-asynchronous-tracking-how-it-work/
    gapiCallbacks.push(function () {
        list_google.getList().then(function(response) {
            let records = response;

            let table = $('#tbl_list_view');
            let diff = $('#diff_view');
            table.find('thead').append(getTableHeader());

            const tbody = table.find('tbody');
            const totalRecordLength = 31;
            const data_start_index = 7;

            records.forEach(function(record: any, index: number, records: any) {
                // gapi will not return empty columns, so we have to pad them 
                if (record.length < totalRecordLength) {
                    let i = totalRecordLength - record.length;
                    while (i-- > 0) record.push("");
                }
                
                let row = list_google.getTableRow(record);
                let row_index = index + data_start_index
                
                row.data('row_index', row_index);
                row.data('current_record', record);
                row.data('prev_record', records[index-1]);
                row.data('next_record', records[index+1]);
                tbody.append(row);
            })
            toggleProgressbar(false);
        }); 
    });
});

function toggleProgressbar(isVisible: boolean) {
    if(isVisible) {
        $('.progress').show();
    } else {
        $('.progress').hide();
    }
}

function toggleListView() {
    $('#container_list_view').show();
    $('#container_page_view').hide();
}

function toggleSignifierAbbreviations(e: any) {
    e.preventDefault();
    $('.info-text').toggle();
    $('#inspectorView').toggleClass('short-view');
}

function getTableHeader() {
    return $('<tr>').append(
        $('<th>').text('ID'), 
        $('<th>').text('Output Date'), 
        $('<th>').text('Site'), 
        $('<th>').text('Page Name'), 
        $('<th>').text('Url'),
        $('<th>').text('Page View Url'),
        $('<th>').text('Last Two'),
        $('<th>').text('Latest to Base'));
}

