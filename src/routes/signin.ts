import { Component } from "../decorators";
import {FirebaseHelper} from "../helper";
import * as firebase from "firebase/app";
import * as ko from "knockout";

require('firebaseui/dist/firebaseui.css');

@Component({
    name: 'signin',
    template: require('./signin.html')
})
export class SignIn {
    private userEmail = ko.observable<string>("");
    constructor() {
        FirebaseHelper.signInWithFirebaseUi();
    }

}