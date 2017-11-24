import { Component } from "../decorators";
import {FirebaseHelper, ServiceWorkerHelper} from "../helper";
import * as ko from "knockout";

@Component({
    name: 'notification',
    template: require('./notification.html')
})
export class NotificationVM {
    private isNotificationSupported = ko.observable(ServiceWorkerHelper.isNotificationsApiSupported);
    private isSubscribed = ko.observable(false);
    
    constructor() {
        FirebaseHelper.checkUserAndRedirectToSignin();
    }
}