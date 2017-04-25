/*
 * Copyright (c) 2017 Allan Pichardo.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {GoogleAuth} from './google-auth';

$(document).ready(function() {
    console.log('ready');

    // TODO: determine if old function calls are needed
    // toggleProgressbar(false);
    // $('#toggle_view').click(toggleView);

    // setPagination()
})

// function setPagination() {
//     var urlParams = new URLSearchParams(window.location.search);
//     var index = parseInt(urlParams.get('index')) || 7;
//     $('#prev_index').text(`<-- Row ${index-1}`).attr('href', `/diffbyindex?index=${index-1}`);
//     $('#next_index').text(`Row ${index+1} -->`).attr('href', `/diffbyindex?index=${index+1}`);
// }

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

function loadIframe(html_embed: string) {
    // inject html
    var iframe = document.getElementById('diff_view');
    iframe.setAttribute('srcdoc', html_embed);

    iframe.onload = function() {
        // inject diff.css to highlight <ins> and <del> elements
        var frm = (frames as any)['diff_view'].contentDocument;
        var otherhead = frm.getElementsByTagName('head')[0];
        var link = frm.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', `${window.location.origin}/css/diff.css`);
        otherhead.appendChild(link);

        // set iframe height = frame content
        iframe.setAttribute('height',(iframe as any).contentWindow.document.body.scrollHeight);
    };
}
