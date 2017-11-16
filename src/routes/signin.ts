import { Component } from "../decorators";
import * as firebase from "firebase/app";
import * as ko from "knockout";

@Component({
    name: 'signin',
    template: require('./signin.html')
})
export class SignIn {
    constructor() {
        
        //this.signIn();
    }
    /*
    private popupOptions: DevExpress.ui.dxPopupOptions = {
        width: 300,
        height: 250,
        contentTemplate: "signin",
        showTitle: true,
        title: "Sign in",
        visible: true,
        dragEnabled: false,
        closeOnOutsideClick: false,
        showCloseButton: false
        //onHidden: ()=> vm.showUserInfo(false)
    }
    private async signIn() {
        // Initialize the FirebaseUI Widget using Firebase.
        // The start method will wait until the DOM is loaded.
        var firebaseui = await import ("firebaseui");
        var ui = firebaseui.auth.AuthUI.getInstance();
        if(!ui){
            ui = new firebaseui.auth.AuthUI(firebase.auth());
        }
         var uiConfig :any = {
            signInSuccessUrl: '/#/home',
            signInFlow: 'redirect',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
            ],
            tosUrl: '/#/about' // TODO implement Terms of service url
        };
        ui.start('#firebaseui-auth-container', uiConfig);
    }
    */
}