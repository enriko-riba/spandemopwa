import { Component } from "../decorators";
import {FirebaseHelper} from "../helper";
import * as ko from "knockout";

@Component({
    name: 'home',
    template: require('./home.html')
})
export class HomeVM {
    private imgURL = ko.observable(require('../assets/funny-home.jpg'));
    constructor() {
        // FirebaseHelper.verifyUserAuthentication();
    }
}