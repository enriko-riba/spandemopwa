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
     * Returns true if push API is supported.
     */
    public static get isPushApiSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    /**
     * Returns true if notifications API is supported.
     */
    public static get isNotificationsApiSupported() {
        return 'Notification' in window;
    }

    /**
     * Returns true if media API is supported.
     */
    public static get isMediaApiSupported() {
        return 'mediaDevices' in navigator && navigator.mediaDevices.getUserMedia;
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
        } else {
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
     * Subscribes the client for push notifications.
     */
    public static subscribeUser(base64encodedApplicationServerPublicKey?: string) {
        if (ServiceWorkerHelper.isServiceWorkerSupported) {
            return navigator.serviceWorker.ready.then(function (reg) {
                //  push options
                var options: PushSubscriptionOptionsInit = {
                    userVisibleOnly: true
                }

                //  if we have an API key decode it
                if (!!base64encodedApplicationServerPublicKey) {
                    var uint8arr = ServiceWorkerHelper.urlB64ToUint8Array(base64encodedApplicationServerPublicKey);
                    options.applicationServerKey = uint8arr;
                }
                return reg.pushManager.subscribe(options)
                    .then(function (sub) {
                        return sub;
                    })
                    .catch(function (e) {
                        if ((Notification as any).permission === 'denied') {
                            console.warn('Permission for notifications was denied');
                        } else {
                            console.error('Unable to subscribe to push', e);
                        }
                    });
            })
        }
    }

    public static urlB64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

export class FirebaseHelper {
    /**
     * Checks if the current user is signed-in and redirects to HREF_SIGNIN
     */
    public static verifyUserAuthentication() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // this.currentUser = new UserInfo(user.email, user.email, user.emailVerified, user.photoURL, user.uid);
                // console.log(this.currentUser);
                console.log("sign in");
                console.log('current user:', user.email);
            } else {
                window.location.href = HREF_SIGNIN;
                console.log("signed out");
            }
        },
            (error) => {
                console.log(error);
            });

    }

    // public static currentUser :UserInfo;

    /**
     * Initializes firebase and returns the app instance.
     */
    public static initFirebase() {
        // Initialize Firebase
        const config = {
            apiKey: "AIzaSyD0cMNr0yCI-9LCCC7PcbEpOALrSXjCfcg",
            authDomain: "spandemopwa.firebaseapp.com",
            databaseURL: "https://spandemopwa.firebaseio.com",
            projectId: "spandemopwa",
            storageBucket: "spandemopwa.appspot.com",
            messagingSenderId: "805463871698"
        };

        FirebaseHelper.firebaseApp = firebase.initializeApp(config);
    }

    public static firebaseApp: firebase.app.App;


    public static uiConfig = {
        signInSuccessUrl: '#/home',
        signInOptions: [
            // providers 
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '#/about'
    };

    public static signInWithFirebaseUi() {
        var firebaseUi = require('firebaseui');
        var ui = firebaseUi.auth.AuthUI.getInstance();
        if (!ui) {
            ui = new firebaseUi.auth.AuthUI(firebase.auth());
        }

        var uiConfig = FirebaseHelper.uiConfig;
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    }

}

// export class UserInfo {
//     constructor(
//         displayName: string,
//         email: string,
//         public emailVerified: boolean,
//         photoURL: string,
//         public uid: string) {

//         this.displayName = ko.observable(displayName);
//         this.email = ko.observable(email);
//         this.photoURL = ko.observable(photoURL);
//     }

//     public displayName = ko.observable<string>("");
//     public email = ko.observable<string>("");
//     public photoURL = ko.observable<string>("");
// }
