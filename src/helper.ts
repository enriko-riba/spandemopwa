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
                firebase.messaging().useServiceWorker(registration); // using app service worker for FCM
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
    // public static getUserSubscription(reg: ServiceWorkerRegistration) {
    //     return reg.pushManager.getSubscription().then(function (sub) {
    //         if (sub === null) {
    //             // Update UI to ask user to register for Push
    //             console.log('Not subscribed to push service!');
    //         } else {
    //             // We have a subscription, update the database
    //             console.log('Subscription object: ', sub);
    //             return sub;
    //         }
    //     });
    // }

    // /**
    //  * Subscribes the client for push notifications.
    //  */
    // public static subscribeUser(base64encodedApplicationServerPublicKey?: string) {
    //     if (ServiceWorkerHelper.isServiceWorkerSupported) {
    //         return navigator.serviceWorker.ready.then(function (reg) {
    //             //  push options
    //             var options: PushSubscriptionOptionsInit = {
    //                 userVisibleOnly: true
    //             }

    //             //  if we have an API key decode it
    //             if (!!base64encodedApplicationServerPublicKey) {
    //                 var uint8arr = ServiceWorkerHelper.urlB64ToUint8Array(base64encodedApplicationServerPublicKey);
    //                 options.applicationServerKey = uint8arr;
    //             }
    //             return reg.pushManager.subscribe(options)
    //                 .then(function (sub) {
    //                     return sub;
    //                 })
    //                 .catch(function (e) {
    //                     if ((Notification as any).permission === 'denied') {
    //                         console.warn('Permission for notifications was denied');
    //                     } else {
    //                         console.error('Unable to subscribe to push', e);
    //                     }
    //                 });
    //         })
    //     }
    // }

    // public static urlB64ToUint8Array(base64String) {
    //     var padding = '='.repeat((4 - base64String.length % 4) % 4);
    //     var base64 = (base64String + padding)
    //         .replace(/\-/g, '+')
    //         .replace(/_/g, '/');

    //     var rawData = window.atob(base64);
    //     var outputArray = new Uint8Array(rawData.length);

    //     for (var i = 0; i < rawData.length; ++i) {
    //         outputArray[i] = rawData.charCodeAt(i);
    //     }
    //     return outputArray;
    // }

    //
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
        signInFlow: 'redirect',
        signInOptions: [
            // providers 
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID
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

/**
 * Generates a UUID
 * @export
 * @returns 
 */
export function generateUUID() {
    // If we have a cryptographically secure PRNG, use that
    // https://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
    var isCrypto = (typeof(window.crypto) != 'undefined' && typeof(window.crypto.getRandomValues) != 'undefined');
    if(isCrypto){
        var buf = new Uint16Array(8);
        window.crypto.getRandomValues(buf);        
        return (s4(buf[0])+s4(buf[1])+"-"+s4(buf[2])+"-"+s4(buf[3])+"-"+s4(buf[4])+"-"+s4(buf[5])+s4(buf[6])+s4(buf[7]));
    } else{
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}

function s4(num): string {
    var ret: string = num.toString(16);
    while(ret.length < 4){ ret = "0"+ret;}
    return ret;
}

/**
 * Renders the img to fit inside the canvas preserving aspect ratio.
 * @param ctx 
 * @param img 
 */
export function imgToCanvas(ctx : CanvasRenderingContext2D, img: HTMLImageElement | ImageBitmap){
    const c = ctx.canvas;
    var imgRatio = img.width / img.height;
    var canvasRatio = ctx.canvas.width / ctx.canvas.height;
    var cH, cW;
    if(c.width > c.height){
        cH = c.height;
        cW = imgRatio * c.height;
    }else{
        cH = imgRatio * c.width;
        cW = c.width;
    }
    c.width = cW;
    c.height = cH;
    
    var hRatio = ctx.canvas.width / img.width    ;
    var vRatio = ctx.canvas.height / img.height  ;
    var ratio  = Math.min ( hRatio, vRatio );
    
    var offsetX, offsetY;
    offsetX = (ctx.canvas.width - img.width) / 2;
    offsetY = (ctx.canvas.height - img.height) / 2;
    if(offsetX < 0) offsetX = 0;
    if(offsetY < 0) offsetY= 0;
    ctx.drawImage(img, 0,0, img.width, img.height, offsetX, offsetY, img.width*ratio, img.height*ratio);
}
