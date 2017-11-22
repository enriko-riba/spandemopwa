import * as firebase from "firebase/app";
import * as ko from "knockout";
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
     * Initializes firebase and returns the app instance.
     */
    public static initFirebase() {
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
    
    /**
     * Checks if a user is signed in, if not redirects to 
     */
    public static checkUserAndRedirectToSignin() {
        var user = firebase.auth().currentUser;
        if (user) {
            console.log('current user:', user.email);
        } else {
            console.log('no user, redirecting to signin...');
            window.location.href = HREF_SIGNIN;
        }
    }

    public static uiConfig = {
        signInSuccessUrl: '#/home',
        signInOptions: [
            // providers 
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        tosUrl: '#/about'   // Terms of service url.
    };

    /**
     * Displays the firebaseui login container.
     */
    public static async signInWithFirebaseUi() {
        var firebaseUi = await import("firebaseui");
        var ui = firebaseUi.auth.AuthUI.getInstance();
        if (!ui) {
            ui = new firebaseUi.auth.AuthUI(firebase.auth());
        }
        ui.start('#firebaseui-auth-container', FirebaseHelper.uiConfig); // The start method will wait until the DOM is loaded.
    }

    /**
     * Signs out the current user.
     */
    public static async signOut() {
        await firebase.auth().signOut();
    }
}

export class UserInfo {
    public displayName = ko.observable<string>("");
    public email = ko.observable<string>("");
    public emailVerified: boolean;
    public photoURL = ko.observable<string>("");
    public uid: string;

    constructor(
        displayName: string = null,
        email: string = null,
        emailVerified: boolean = null,
        photoURL: string = null,
        uid: string = null) {

        this.displayName = ko.observable(displayName);
        this.emailVerified = emailVerified;
        this.email = ko.observable(email);
        this.photoURL = ko.observable(photoURL);
        this.uid = uid;
    }
}


// credit: http://www.javascriptkit.com/javatutors/touchevents2.shtml
export class SwipeDetect {
    public static swipedetect(el, callback) {
        var touchsurface = el,
            swipedir,
            startX,
            startY,
            distX,
            distY,
            threshold = 150, //required min distance traveled to be considered swipe
            restraint = 100, // maximum distance allowed at the same time in perpendicular direction
            allowedTime = 500, // maximum time allowed to travel that distance
            elapsedTime,
            startTime,
            handleswipe = callback || function (swipedir) { }

        touchsurface.addEventListener('touchstart', function (e) {
            var touchobj = e.changedTouches[0]
            swipedir = 'none'
            var dist = 0
            startX = touchobj.pageX
            startY = touchobj.pageY
            startTime = new Date().getTime() // record time when finger first makes contact with surface
            e.preventDefault()
        }, false)

        touchsurface.addEventListener('touchmove', function (e) {
            e.preventDefault() // prevent scrolling when inside DIV
        }, false)

        touchsurface.addEventListener('touchend', function (e) {
            var touchobj = e.changedTouches[0]
            distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
            distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
            elapsedTime = new Date().getTime() - startTime // get time elapsed
            if (elapsedTime <= allowedTime) { // first condition for awipe met
                if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
                    swipedir = (distX < 0) ? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
                }
                else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
                    swipedir = (distY < 0) ? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
                }
            }
            handleswipe(swipedir)
            e.preventDefault()
        }, false)
    }
}