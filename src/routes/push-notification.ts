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
                    });

                navigator.serviceWorker.onmessage = this.onMessage;
            }
        }
    }


    private onSubscribeClick = async () => {
        if (this.isSubscribed()) {    //  unsubscribe
            this.isSubscribed(false);
        } else { //  subscribe
            this.askForPermission(); // firebase-messaging
            this.isSubscribed(true);
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
            this.subscriptionEndpoint(token);
            this.saveSubscriptionToDb(token);
        }).catch((e) => {
            console.log("Error token!", e);
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
    }

    private removeSubscriptionFromDb = () => {
        if (this.user) {
            this.subscriptionEndpoint("n/a");
            this.fireStoreUserRef = firebase.firestore().collection('users');
            this.fireStoreUserRef.doc(this.user.email).delete();
        }
    }

    private onSubscriptionChange = ko.computed(() => {
        var isSubscribed = this.isSubscribed();
        if (isSubscribed) {
            this.subscribeText("Unsubscribe from push");
            this.handlePushToken();
        } else {
            this.removeSubscriptionFromDb(); // unsubscribe user and delte token
            this.subscribeText("Subscribe for push");
        }
    });
}