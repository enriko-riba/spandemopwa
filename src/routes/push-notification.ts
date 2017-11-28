import * as ko from "knockout";
import { Component } from "../decorators";
import { FirebaseHelper, ServiceWorkerHelper } from "../helper";
import * as firebase from "firebase/app";
import { firestore } from "firebase/app";


const apiKey = "BL1CdQeUXJd42r51j3DHc-gZ29EjuVnvxp0QHx7JMw1h5U9Ze30TdhFJjRIETK3b8QNxpJypEuMD4daVrgXFui8";

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

    private onSubscriptionChange = ko.computed(() => {
        var isSubscribed = this.isSubscribed();
        if (isSubscribed) {
            let json = JSON.stringify(this.subscription);
            this.subscriptionJSON(json);
            this.subscribeText("Unsubscribe from push");
            json = JSON.stringify(this.subscription.endpoint);
            this.subscriptionEndpoint(json);
            console.log(json);
            this.saveSubscriptionToDb(json);
        } else {
            this.subscriptionJSON("n/a");
            this.subscribeText("Subscribe for push");
            this.subscriptionEndpoint("n/a");
        }
    });

    private saveSubscriptionToDb = (json) => {
        if (this.user) {
            var data = {
                uid: this.user.uid,
                subData: json,
            }
            console.log(data);
            this.fireStoreUserRef = firebase.firestore().collection('users');
            this.fireStoreUserRef.doc(this.user.email).set(data);
        }
    }
}