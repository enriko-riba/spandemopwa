import { Component } from "../decorators";
import {FirebaseHelper, ServiceWorkerHelper} from "../helper";
import * as ko from "knockout";

@Component({
    name: 'notification',
    template: require('./notification.html')
})
export class NotificationVM {
    private isNotificationSupported = ko.observable(ServiceWorkerHelper.isNotificationsApiSupported);
    
    constructor() {
        FirebaseHelper.checkUserAndRedirectToSignin();
    }

    private onNotifyClick = ()=>{
        navigator.serviceWorker.getRegistration()
            .then(reg => {
                var options = {
                    body: "this is a self generated notification",
                    icon: 'assets/push.png',
                    vibrate: [100, 50, 100],                    
                    actions: [
                        {action: 'close', title: 'Close', icon: require('../assets/no-user.jpg')}
                    ],
                    client: 'default'
                };
                reg.showNotification("My notification", options)
            });
    }
}