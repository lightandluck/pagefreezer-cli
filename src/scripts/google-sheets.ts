// function initClient() {
//     // Retrieve the discovery document for version 3 of Google Drive API.
//     // In practice, your app can retrieve one or more discovery documents.
//     let discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest';

//     // Initialize the gapi.client object, which app uses to make API requests.
//     // Get API key and client ID from API Console.
//     // 'scope' field specifies space-delimited list of access scopes.
//     gapi.client.init({
//         'apiKey': 'AIzaSyBP2ieKfg0O0kw8nsp9oblQScZOBL-Zp9c',
//         'discoveryDocs': [discoveryUrl],
//         'clientId': '211820258595-4j5qg0orud1dfaoqje5glif74dolg7vk.apps.googleusercontent.com',
//         'scope': SCOPE
//     }).then(function () {
//         GoogleAuth = gapi.auth2.getAuthInstance();

//         // Listen for sign-in state changes.
//         GoogleAuth.isSignedIn.listen(updateSigninStatus);

//         // Handle initial sign-in state. (Determine if user is already signed in.)
//         var user = GoogleAuth.currentUser.get();
//         setSigninStatus(false);

//         // Call handleAuthClick function when user clicks on
//         //      "Sign In/Authorize" button.
        
//     });
// }

// Initializes Google Apis and exports GoogleAuth object for us to use.
export let GoogleAuth: gapi.auth2.GoogleAuth,
    SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

$(document).ready(() => {
    handleClientLoad();
    $('#sign-in-or-out-button').click(function () {
        handleAuthClick();
    });
    $('#revoke-access-button').click(function () {
        revokeAccess();
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

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
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
            setSigninStatus(false);
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

function setSigninStatus(isSignedIn: boolean) {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sign out');
        $('#revoke-access-button').css('display', 'inline-block');
        $('#auth-status').html('You are currently signed in and have granted ' +
            'access to this app.');
    } else {
        $('#sign-in-or-out-button').html('Sign In/Authorize');
        $('#revoke-access-button').css('display', 'none');
        $('#auth-status').html('You have not authorized this app or you are ' +
            'signed out.');
    }
}

// entry point for sign-in listener 
// not currently using isSignedIn parameter for anything significant.
// because of Google example. 
// TODO: refactor?
function updateSigninStatus(isSignedIn: boolean) {
    setSigninStatus(isSignedIn);
}


