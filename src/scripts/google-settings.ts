import {gapiCallbacks} from './google-auth';
import {setupListView} from './listview-google';

$(document).ready(() => {
    $('#settings').click(handleSettings); 

    //TODO - create init function to show settings if none exist
    if (!localStorage.getItem('analyst_sheet_path')) {
        handleSettings();
    }

    // // TODO - Remove after done showing people tests
    if (!localStorage.getItem('TestDefaults')) {
        setTestDefaults();
    }
});

function setTestDefaults() {
    $.getJSON('./config.json', function(config: any) {
        let analyst_sheet_path = config.ANALYST_TESTPATH;
        let important_changes_path = config.CHANGES_TESTPATH;
        let dictionary_path = config.DICTIONARY_TESTPATH;

        $('#analyst_sheet_path').val(analyst_sheet_path);
        $('#analyst_sheet_url').attr('href', analyst_sheet_path);

        $('#important_changes_path').val(important_changes_path);
        $('#important_changes_url').attr('href', important_changes_path);

        $('#dictionary_path').val(dictionary_path);
        $('#dictionary_url').attr('href', dictionary_path);
    });
}

export function handleSettings() {
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

    if (!localStorage.getItem('TestDefaults')) {
        localStorage.setItem('TestDefaults', 'true');
        setupListView();
    }
    
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



