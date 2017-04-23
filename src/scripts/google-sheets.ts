// Initializes Google Apis and exports GoogleAuth object for us to use.
export let  GoogleAuth: gapi.auth2.GoogleAuth,
            SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

$(document).ready(() => {
    handleClientLoad();
    $('#sign-in-or-out-button').click(function () {
        handleAuthClick();
    });
    $('#revoke-access-button').click(function () {
        revokeAccess();
    });

    $('#settings').click(function() {
        return $.get('settings.html', function(data) {
            bootbox.dialog({
                title: 'Settings',
                message: data,
                buttons: {
                    "Save": {
                        className: 'btn-success',
                        callback: function() {
                        localStorage.setItem('important_changes_path', $('#important_changes_path').val());
                        localStorage.setItem('dictionary_path', $('#dictionary_path').val());
                        }
                    },
                    "Cancel": {
                        className: 'btn-default'
                    }
                }
            });
            let changes_url = localStorage.getItem('important_changes_path');
            let dictionary_url = localStorage.getItem('dictionary_path');

            $('#important_changes_path').val(changes_url);
            $('#changes_url').attr('href', changes_url);
            $('#dictionary_path').val(dictionary_url);
            $('#dictionary_url').attr('href', dictionary_url);
        });
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
    let discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest';

    // Initialize the gapi.client object, which the app uses to make API requests.
    // Get API key and client ID from config.json.
    // 'scope' field specifies space-delimited list of access scopes.
    $.getJSON('./config.json', function (data) {
        let API_KEY = data.API_KEY,
            CLIENT_ID = data.CLIENT_ID;
        
        gapi.client.init({
            'apiKey': API_KEY,
            'discoveryDocs': [discoveryUrl],
            'clientId': CLIENT_ID,
            'scope': SCOPE
        }).then(function () {
            GoogleAuth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            GoogleAuth.isSignedIn.listen(updateSigninStatus);

            // Handle initial sign-in state. (Determine if user is already signed in.)
            updateSigninStatus(false);
        });
    })
    .fail(() => console.log('Could not load config.json'));
}

export function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked 'Sign out' button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}

export function revokeAccess() {
    GoogleAuth.disconnect();
}

function updateSigninStatus(isSignedIn: boolean) {
    let user = GoogleAuth.currentUser.get();
    let isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sign out');
        let profile = user.getBasicProfile();
        $('#auth-status').html(`Welcome, ${profile.getName()}`);
    } else {
        $('#sign-in-or-out-button').html('Sign In');
        $('#auth-status').html('');
    }
}


