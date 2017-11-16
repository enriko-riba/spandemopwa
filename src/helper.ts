import * as firebase from "firebase/app";
export const HREF_SIGNIN = "#/signin";

/**
 * Registers the givren script name as a service worker
 */
export function registerServiceWorker(scriptName: string) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(scriptName).then(function (registration) {
            console.log('ServiceWorker registered with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
};

/**
 * Checks if the current user is signed-in and redirects to  
 */
export function checkUser() {
    var user = firebase.auth().currentUser;
    if (user) {
        console.log('current user:', user.email);
    } else {
        console.log('no user, redirecting to signin...');
        window.location.href = HREF_SIGNIN;
    }
}

/**
 * Initializes firebase and returns the app instance.
 */
export function initFirebase() {
    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyD0cMNr0yCI-9LCCC7PcbEpOALrSXjCfcg",
        authDomain: "spandemopwa.firebaseapp.com",
        databaseURL: "https://spandemopwa.firebaseio.com",
        projectId: "spandemopwa",
        storageBucket: "spandemopwa.appspot.com",
        messagingSenderId: "805463871698"
    };

    firebaseApp = firebase.initializeApp(config);
}

export var firebaseApp: firebase.app.App;