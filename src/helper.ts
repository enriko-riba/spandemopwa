import * as firebase from "firebase/app";
export const HREF_SIGNIN = "#/signin";

/**
 * Registers the givren script name as a service worker
 */
export function registerServiceWorker(scriptName: string) {
    if ('serviceWorker' in navigator) {
        return navigator.serviceWorker.register(scriptName).then(function (registration) {
            console.log('ServiceWorker registered with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
};


export function getUserSubscription(reg: ServiceWorkerRegistration) {

    reg.pushManager.getSubscription().then(function (sub) {
        if (sub === null) {
            // Update UI to ask user to register for Push
            console.log('Not subscribed to push service!');
        } else {
            // We have a subscription, update the database
            console.log('Subscription object: ', sub);
            return sub;
        }
    });
}
export function subscribeUser() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function (reg) {

            reg.pushManager.subscribe({
                userVisibleOnly: true
            }).then(function (sub) {
                console.log('Endpoint URL: ', sub.endpoint);
            }).catch(function (e) {
                if ((Notification as any).permission === 'denied') {
                    console.warn('Permission for notifications was denied');
                } else {
                    console.error('Unable to subscribe to push', e);
                }
            });
        })
    }
}


/**
 * Checks if the current user is signed-in and redirects to  
 */
export function checkUser() {
    var user = firebase.auth().currentUser;
    console.log(user);
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