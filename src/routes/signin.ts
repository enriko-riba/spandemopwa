import { Component } from "../decorators";
import * as helper from "../helper";
import * as firebase from "firebase/app";
import * as ko from "knockout";


require("firebaseui/dist/firebaseui.css");

@Component({
    name: 'signin',
    template: require('./signin.html')
})
export class SignIn {
    constructor() {
        this.signIn();
    }

    // sign in  with firebase UI
    private signIn() {
        var firebaseUI = require('firebaseui');

        var uiConfig = {
            signInSuccessUrl: '/#/home',
            signInOptions: [
                //providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
            ],
            // Terms of service url.
            tosUrl: '/#/about'
        };
        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseUI.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    }
}