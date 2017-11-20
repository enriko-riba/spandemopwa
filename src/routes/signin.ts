import { Component } from "../decorators";
import * as helper from "../helper";
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
        this.signIn();
    }

    // sign in  with google acc - redirect
    private signIn = () => {
        var firebaseUi = require('firebaseui');
        var ui = firebaseUi.auth.AuthUI.getInstance();
        if(!ui){
            ui = new firebaseUi.auth.AuthUI(firebase.auth());
        }
        var uiConfig = {
            signInSuccessUrl: '#/home',
            signInOptions: [
              // Leave the lines as is for the providers you want to offer your users.
              firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            // Terms of service url.
            tosUrl: '#/about'
          };
          // The start method will wait until the DOM is loaded.
          ui.start('#firebaseui-auth-container', uiConfig);
    }

    private authObserve = ()=>{
            firebase.auth().onAuthStateChanged((user)=> {
              if (user) {
                console.log("signed in");
                // User is signed in.
                var displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                var photoURL = user.photoURL;
                var uid = user.uid;
                var phoneNumber = user.phoneNumber;
                var providerData = user.providerData;
             
              } else {
                // User is signed out.
                console.log("signed out");
              }
            },
            (error)=> {
              console.log(error);
          });
    }
}