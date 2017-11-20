import { Component } from "../decorators";
import {FirebaseHelper} from "../helper";
import * as ko from "knockout";
import * as firebase from "firebase/app";

@Component({
    name: 'home',
    template: require('./home.html')
})
export class HomeVM {
    private imgURL = ko.observable(require('../assets/funny-home.jpg'));
    constructor() {
        console.log(firebase.auth().currentUser);
        FirebaseHelper.verifyUserAuthentication();
    }
}