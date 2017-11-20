import { Component } from "../decorators";
import {FirebaseHelper} from "../helper";
import * as ko from "knockout";

@Component({
    name: 'notification',
    template: require('./notification.html')
})
export class NotificationVM {
    private isNotificationSupported = ko.observable(false);

    constructor() {
        //FirebaseHelper.checkUser();    
    }
}