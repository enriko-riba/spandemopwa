import { Component } from "../decorators";
import {FirebaseHelper, ServiceWorkerHelper} from "../helper";
import * as ko from "knockout";

@Component({
    name: 'push-notification',
    template: require('./push-notification.html')
})
export class PushNotificationVM {
    private isPushSupported = ko.observable(false);
    private swRegistration: ServiceWorkerRegistration;
    constructor() {
        FirebaseHelper.verifyUserAuthentication();
        this.isPushSupported(ServiceWorkerHelper.isPushApiSupported);
        if (this.isPushSupported()) {
            navigator.serviceWorker.getRegistration().then(reg => this.swRegistration = reg);
        }
    }
}