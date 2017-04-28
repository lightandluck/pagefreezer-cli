$(document).ready(function() {
    // setup handlers 
    $('#lnk_toggle_signifiers').click(toggleSignifierAbbreviations);
    $('#lnk_view_list').click(toggleListView);  
});

function toggleListView() {
    $('#container_list_view').show();
    $('#container_page_view').hide();
}

function togglePageView() {
    $('#container_list_view').hide();
    $('#container_page_view').show();
}

function toggleProgressbar(isVisible: boolean) {
    if(isVisible) {
        $('.progress').show();
    } else {
        $('.progress').hide();
    }
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