import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";
import * as firebase from "firebase/app";
import * as ko from "knockout";

require('firebaseui/dist/firebaseui.css');

@Component({
    name: 'real-time-update',
    template: require('./real-time-update.html')
})
export class DbUpdate {
    constructor() {
this.SubscribeToDbCahnges();
    }

    private SubscribeToDbCahnges=()=>{
        var dbRef = firebase.database().ref().child('object');

        dbRef.on('value', newObject=>{
            console.log(newObject.val());
        })
    }

}