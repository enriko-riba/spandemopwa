import { Component } from "../decorators";
import * as helper from "../helper";
import * as firebase from "firebase/app";
import * as ko from "knockout";



@Component({
    name: 'signin',
    template: require('./signin.html')
})
export class SignIn {
    private userEmail = ko.observable<string>("");
    constructor() {
        // this.signIn();
    }

    // sign in  with google acc - redirect
    private googleSignIn() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        provider.setCustomParameters({
            'login_hint': 'user@gmail.com'
        });
        firebase.auth().signInWithRedirect(provider);

        firebase.auth().getRedirectResult().then((result)=> {
            window.location.href = "#/home";

            if (result.credential) {
              // This gives you a Google Access Token. You can use it to access the Google API.
              var token = result.credential.accessToken;
              // ...
            }
            // The signed-in user info.
            var user = result.user;
          }).catch((error)=> {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          });
    }

    private emailSignIn() {
        firebase.auth().signInAnonymously().catch((error)=> {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
          });

          firebase.auth().onAuthStateChanged((user) =>{
            if (user) {
              // User is signed in.
              var isAnonymous = user.isAnonymous;
              var uid = user.uid;

              if(this.userEmail().trim().length>0)
              {
                var randomPass = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);  
                var credential = firebase.auth.EmailAuthProvider.credential(this.userEmail(), randomPass);
                user.linkWithCredential(credential).then(function(user) {
                    console.log("Anonymous account successfully upgraded", user);
                    window.location.href = "#/home";
                  }, function(error) {
                    console.log("Error upgrading anonymous account", error);
                  });
              }
             
            } else {
              // User is signed out.
              // ...
            }
         });

    }


}