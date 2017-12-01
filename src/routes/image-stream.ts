import * as ko from "knockout";
import * as firebase from "firebase/app";
import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";

@Component({
    name: 'image-stream',
    template: require('./image-stream.html')
})
export class ImageStreamVM {
    private user;
    private firestoreRef: firebase.firestore.CollectionReference;
    private images = ko.observableArray<ImageDoc>();

    constructor() {
        FirebaseHelper.checkUserAndRedirectToSignin();
        this.user = firebase.auth().currentUser;
        if(this.user){
            this.setupImageStreaming();            
        }
    }

    private setupImageStreaming(){
        this.firestoreRef = firebase.firestore().collection('images');
        this.firestoreRef.orderBy('created', 'desc').limit(5)
            .onSnapshot( collection => {
                var tmpArray:Array<ImageDoc> = [];
                collection.docs.forEach((value, idx, array) => {
                    var data = value.data() as ImageDoc;
                    
                    tmpArray.push(data);
                })
                this.images(tmpArray);
        });
    }
}

interface ImageDoc {
    created: Date,
    downloadURL: string,
    imgMetadata: any
}