import { Component } from "../decorators";
import * as helper from "../helper";
import * as ko from "knockout";

@Component({
    name: 'push-notification',
    template: require('./push-notification.html')
})
export class PushNotificationVM {
    constructor() {
        helper.checkUser();
    }
}