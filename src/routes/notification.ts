import { Component } from "../decorators";
import * as helper from "../helper";
import * as ko from "knockout";

@Component({
    name: 'notification',
    template: require('./notification.html')
})
export class NotificationVM {
    private isNotificationSupported = ko.observable(false);
    
    constructor() {
        //helper.checkUser();       
    }
}