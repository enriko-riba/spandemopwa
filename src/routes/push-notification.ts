import * as ko from "knockout";
import { Component } from "../decorators";
import {FirebaseHelper, ServiceWorkerHelper} from "../helper";

const apiKey ="BJlkbCrtC3-w8jf12sBS5-jzHULVGycf7a7jIXTCO2N7xPtZfCUsVmCOtWYD2qjKmxjGy2Mk1cJwT_lKLNNTfQ0";

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
    private subscription :PushSubscription;
    constructor() {

        if(ServiceWorkerHelper.isPushApiSupported) {
            this.isPushSupported(true);
            navigator.serviceWorker.getRegistration()
                .then(reg => {
                    this.registration = reg;
                    ServiceWorkerHelper.getUserSubscription(reg)
                        .then( sub => {
                            this.subscription = sub;
                            this.isSubscribed(!!sub);                            
                         });
                });
        }
    }

    
    private onSubscribeClick = async ()=>{
        if(this.isSubscribed()){    //  unsubscribe
            var success = await this.subscription.unsubscribe();
            if(success){
                this.subscription = null;
                this.isSubscribed(false);
            }
        }else { //  subscribe
            var sub = await ServiceWorkerHelper.subscribeUser(apiKey);
            if(sub){
                this.subscription = sub;
                this.isSubscribed(true);
            }
        }
    }

    private onSubscriptionChange = ko.computed( ()=>{
        var isSubscribed = this.isSubscribed();
        if(isSubscribed){
            let json = JSON.stringify(this.subscription);
            this.subscriptionJSON(json);
            this.subscribeText("Unsubscribe from push");
            json = JSON.stringify(this.subscription.endpoint);
            this.subscriptionEndpoint(json);
        }else {
            this.subscriptionJSON("n/a");
            this.subscribeText("Subscribe for push");
            this.subscriptionEndpoint("n/a");
        }
    });
}