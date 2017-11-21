import { Component } from "../decorators";
import {FirebaseHelper} from "../helper";
import * as ko from "knockout";

@Component({
    name: 'home',
    template: require('./home.html')
})
export class HomeVM {
    constructor() {
        FirebaseHelper.isUserSignedIn();
    }
}