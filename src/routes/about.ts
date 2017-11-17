import { Component } from "../decorators";
import * as helper from "../helper";
import * as firebase from "firebase/app";
import * as ko from "knockout";

@Component({
    name: 'about',
    template: require('./about.html')
})
export class About {
    constructor() {
        // TODO
    }
}