import * as firebase from "firebase/app";
export const HREF_SIGNIN = "#/signin";

export class ServiceWorkerHelper {
    /**
     * Returns true if the client supports service workers
     */
    public static get isServiceWorkerSupported() {
        return 'serviceWorker' in navigator;
    }

    /**
     * Registers the givren script name as a service worker
     */
    public static registerServiceWorker(scriptName: string) {
        if (ServiceWorkerHelper.isServiceWorkerSupported) {
            return navigator.serviceWorker.register(scriptName).then(function (registration) {
                console.log('ServiceWorker registered with scope: ', registration.scope);
            }, function (err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        } else{
            console.log('ServiceWorker not supported, use a real platform/browser instead!');
        }
    };

    /**
     * Returns the clients push notification subscription
     * @param reg 
     */
    public static getUserSubscription(reg: ServiceWorkerRegistration) {
        return reg.pushManager.getSubscription().then(function (sub) {
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

    /**
     * Subscribs the client for push notifications.
     */
    public static subscribeUser() {
        if (ServiceWorkerHelper.isServiceWorkerSupported) {
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