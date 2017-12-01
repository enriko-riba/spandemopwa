import * as ko from "knockout";
import * as firebase from "firebase/app";
import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";

@Component({
    name: 'image-stream',
    template: require('./image-stream.html')
})
export class ImageStreamVM {
    constructor() {

    }
}