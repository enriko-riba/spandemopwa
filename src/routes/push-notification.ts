import * as ko from "knockout";
import { Component } from "../decorators";
import { FirebaseHelper, ServiceWorkerHelper } from "../helper";
import * as firebase from "firebase/app";
import { firestore } from "firebase/app";


const apiKey = "BL1CdQeUXJd42r51j3DHc-gZ29EjuVnvxp0QHx7JMw1h5U9Ze30TdhFJjRIETK3b8QNxpJypEuMD4daVrgXFui8";

const messaging = firebase.messaging();

@Component({
    name: 'push-notification',
    template: require('./push-notification.html')
})
export class PushNotificationVM {
    private isPushSupported = ko.observable(false);
    private isSubscribed = ko.observable(false);
    private subscriptionJSON = ko.observable("");
    private subscriptionEndpoint = ko.observable("");
    private subscribeText = ko.observable("Subscribe");

    private registration: ServiceWorkerRegistration;
    private subscription: PushSubscription;
    private user;
    private fireStoreUserRef: firestore.CollectionReference;

    constructor() {
        FirebaseHelper.checkUserAndRedirectToSignin();
        this.user = firebase.auth().currentUser;
        if (this.user) {
            if (ServiceWorkerHelper.isPushApiSupported) {
                this.isPushSupported(true);
                navigator.serviceWorker.getRegistration()
                    .then(reg => {
                        this.registration = reg;
                        ServiceWorkerHelper.getUserSubscription(reg)
                            .then(sub => {
                                this.subscription = sub;
                                this.isSubscribed(!!sub);
                            });
                    });

                navigator.serviceWorker.onmessage = this.onMessage;
            }
        }
    }


    private onSubscribeClick = async () => {
        if (this.isSubscribed()) {    //  unsubscribe
            var success = await this.subscription.unsubscribe();
            if (success) {
                this.subscription = null;
                this.isSubscribed(false);
            }
        } else { //  subscribe
            this.askForPermission(); // firebase-messaging
            var sub = await ServiceWorkerHelper.subscribeUser(apiKey);
            if (sub) {
                this.subscription = sub;
                this.isSubscribed(true);
            }
        }
    }

    private onMessage(e) {
        console.log("from serviceworker: ", e.data);
    }

    private askForPermission = () => {
        messaging.requestPermission().then(() => {
            console.log("Notify!");
            this.handlePushToken(); // firebase-messaging-getToken
        }).catch(() => {
            console.log("Error!");
        });

        messaging.onTokenRefresh(() => {
            this.handlePushToken();
        });

    }

    private handlePushToken = () => {
        messaging.getToken().then((token) => {
            console.log(token);
            this.saveSubscriptionToDb(token);
        }).catch(() => {
            console.log("Error token!");
        });
    }

    private saveSubscriptionToDb = (token) => {
        if (this.user) {
            var data = {
                uid: this.user.uid,
                registrationtoken: token,
            }
            console.log(data);
            this.fireStoreUserRef = firebase.firestore().collection('users');
            this.fireStoreUserRef.doc(this.user.email).set(data);
        }
        
        messaging.onMessage(function (payload) {
            console.log("Message received. ", payload);
            // ...
        });

        messaging.setBackgroundMessageHandler(function (payload) {
            console.log('[ServiceWorker] received background message ', payload);
            // Customize notification here
            const notificationTitle = 'Background Message Title';
            const notificationOptions = {
                body: 'Background Message body.',
                icon: '/firebase-logo.png'
            }
        });
    }

    private removeSubscriptionFromDb = () => {
        if (this.user) {
            this.fireStoreUserRef = firebase.firestore().collection('users');
            this.fireStoreUserRef.doc(this.user.email).delete();
        }
    }



    private onSubscriptionChange = ko.computed(() => {
        var isSubscribed = this.isSubscribed();
        if (isSubscribed) {
            let json = JSON.stringify(this.subscription);
            this.subscriptionJSON(json);
            this.subscribeText("Unsubscribe from push");
            json = JSON.stringify(this.subscription.endpoint);
            this.subscriptionEndpoint(json);
        } else {
            this.removeSubscriptionFromDb(); // unsubscribe user and delte token
            this.subscriptionJSON("n/a");
            this.subscribeText("Subscribe for push");
            this.subscriptionEndpoint("n/a");
        }
    });


}